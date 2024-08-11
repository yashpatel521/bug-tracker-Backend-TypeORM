import { NextFunction, Request, Response } from "express";
import ApiResponse from "../Response/ApiResponse";
import projectsService from "../services/projects.service";
import { BadRequest } from "../Errors/errors";
import { UserProject } from "../entity/userProject.entity";
import userProjectService from "../services/userProject.service";
import { deleteFile, fileUploader } from "../utils/imageUpload";
import { UploadedFile } from "express-fileupload";
import versionService from "../services/version.service";
import { Version } from "../entity/version.entity";
import pinProjectService from "../services/pinProject.service";
import { PinnedProject } from "../entity/pinnedProject.entity";
import { checkRoleAccess } from "../utils/commonFunction";
import { Project } from "../entity/project.entity";
import bugService from "../services/bug.service";
import { User } from "../entity/user.entity";
import { BugImage } from "../entity/bugImage.entity";
import { Bug } from "../entity/bug.entity";

class ProjectsController {
  async createProject(req: Request | any, res: Response, next: NextFunction) {
    try {
      const {
        title,
        description,
        appId,
        appUrl,
        appIcon,
        developer,
        developerId,
        developerEmail,
        firebaseAccount,
        privacyPolicyUrl,
        status,
        appType,
      } = req.body;
      const user = req.user;
      if (!checkRoleAccess(user, ["admin"])) {
        throw new BadRequest("Unauthorized to create project");
      }
      let projectObj = {
        title: title,
        summary: "",
        description: description || "",
        descriptionHTML: description || "",
        appId: appId || "",
        appUrl: appUrl || "",
        appIcon: appIcon || "",
        developer: developer || "",
        developerId: developerId || "",
        developerEmail: developerEmail || "",
        firebaseAccount: firebaseAccount || "",
        privacyPolicyUrl: privacyPolicyUrl || "",
        status: status || "inprogress",
        createdBy: user,
        appType: appType || "google",
      };

      if (req.files?.appIcon as UploadedFile) {
        const file = req.files?.appIcon as UploadedFile;
        projectObj.appIcon = await fileUploader(file, "project/icon");
      }

      const project = await Project.create({ ...projectObj });
      // assign this user to the project
      const result = await projectsService.createOrUpdateProject(project);
      const userProjectAdd = await UserProject.create({
        user: { id: user.id },
        project: { id: result.id },
      });
      await userProjectService.create(userProjectAdd);

      return ApiResponse.successResponse(res, result);
    } catch (error) {
      return next(error);
    }
  }

  async viewAll(req: Request | any, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const { query, currentPage } = req.query;
      const data = await projectsService.getAllProjectByUser(user, {
        query,
        currentPage,
      });
      return ApiResponse.successResponse(res, data);
    } catch (error) {
      return next(error);
    }
  }

  async viewProjectDetails(
    req: Request | any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { projectId } = req.params;
      const user = req.user;

      if (!checkRoleAccess(user, ["admin"])) {
        const checkAccess = await projectsService.checkAccessToProjectByUser(
          projectId,
          user.id
        );
        if (!checkAccess) {
          throw new BadRequest("Not authorized to access this project");
        }
      }
      const project = await projectsService.getProjectByIdWithDetails(
        +projectId,
        +user.id
      );
      if (!project) {
        throw new BadRequest("Project not found");
      }
      return ApiResponse.successResponse(res, project);
    } catch (error) {
      return next(error);
    }
  }

  async editUserToProject(
    req: Request | any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;
      const { projectId, userIds } = req.body;
      if (!checkRoleAccess(user, ["admin"])) {
        throw new BadRequest("Not authorized to perform this action");
      }
      if (!userIds.length) throw new BadRequest("User not found");
      await userProjectService.deleteProjectUser(projectId);

      for (const user of userIds) {
        const userProjectAdd = await UserProject.create({
          user: { id: +user },
          project: { id: +projectId },
        });
        await userProjectService.create(userProjectAdd);
      }

      return ApiResponse.successResponse(res, {
        message: "User added successfully",
      });
    } catch (error) {
      return next(error);
    }
  }

  async memberInProject(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const user = req.user;

      const usersInProject = await userProjectService.getUsersInProject(
        +projectId
      );
      return ApiResponse.successResponse(res, usersInProject);
    } catch (error) {
      return next(error);
    }
  }

  async addVersionToProject(
    req: Request | any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        projectId,
        versionNumber,
      }: {
        versionNumber: string;
        projectId: number;
      } = req.body;
      const user = req.user;
      let apkFile = req.files?.apkFile as UploadedFile;
      if (!apkFile) throw new Error("Apk file is required");
      //check file type .apk, .apkm, etc
      if (!apkFile.name.match(/\.(apk|apkm)$/i)) {
        throw new BadRequest("Invalid file type. Only apk or apkm allowed");
      }

      let liveUrl = "";
      const project = await projectsService.getProjectById(+projectId);
      if (!project) {
        throw new BadRequest("Project not found");
      }
      const checkVesrionNameExists =
        await versionService.getVersionByVersionNumber(
          versionNumber,
          projectId
        );

      if (checkVesrionNameExists) {
        throw new BadRequest("Version name already exists");
      }

      if (apkFile) {
        liveUrl = await fileUploader(apkFile, "version");
      }

      let version = new Version();
      version.versionNumber = versionNumber;
      version.project = project;
      version.liveUrl = liveUrl;
      version.createdBy = user;
      version = await versionService.create(version);

      return ApiResponse.successResponse(res, version);
    } catch (error) {
      return next(error);
    }
  }

  async getVersions(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const project = await projectsService.getProjectById(+projectId);
      if (!project) {
        throw new BadRequest("Project not found");
      }
      const lastVersion = await versionService.getVersions(+projectId);
      return ApiResponse.successResponse(res, lastVersion);
    } catch (error) {
      return next(error);
    }
  }

  async tooglePin(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { isPinned } = req.body;
      const user = req.user;

      const checkPinProjectExists =
        await pinProjectService.checkPinProjectExists(+projectId, +user.id);
      if (isPinned) {
        if (checkPinProjectExists) {
          throw new BadRequest("Project already pinned");
        }
        const project = await projectsService.getProjectById(+projectId);
        if (!project) {
          throw new BadRequest("Project not found");
        }
        const pinProject = PinnedProject.create({
          user: user,
          project: project,
        });

        await pinProjectService.create(pinProject);
        return ApiResponse.successResponse(res, {
          message: "Project pinned successfully",
        });
      } else {
        if (!checkPinProjectExists) {
          throw new BadRequest("Project not pinned");
        }

        await pinProjectService.delete(checkPinProjectExists.id);
        return ApiResponse.successResponse(res, {
          message: "Project unpinned successfully",
        });
      }
    } catch (error) {
      return next(error);
    }
  }

  async getPinProjects(req: Request | any, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const pinProjects = await pinProjectService.getPinProjects(user.id);
      return ApiResponse.successResponse(res, pinProjects);
    } catch (error) {
      return next(error);
    }
  }

  async getProjectReports(
    req: Request | any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;
      const report = await projectsService.getProjectReports(user);
      return ApiResponse.successResponse(res, report);
    } catch (error) {
      return next(error);
    }
  }

  async getProjectsBugsByVesrioinId(
    req: Request | any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { versionId, projectId } = req.params;
      const { query, currentPage, sortBy, sortOrder } = req.query;

      const bugs = await bugService.getBugsByProjectAndVersionId(
        projectId,
        +versionId,
        {
          query: query?.toString(),
          currentPage: currentPage?.toString() || "1",
          sortBy: sortBy?.toString() || "createdAt",
          sortOrder: sortOrder?.toString() || "DESC",
        }
      );
      return ApiResponse.successResponse(res, bugs);
    } catch (error) {
      return next(error);
    }
  }

  async getBugDetail(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { bugId } = req.params;
      const bug = await bugService.getBugById(+bugId);
      return ApiResponse.successResponse(res, bug);
    } catch (error) {
      return next(error);
    }
  }

  async updateBugDetail(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { id, title, description, status, priority, type, assignedTo } =
        req.body;
      const newAssignedTo = JSON.parse(assignedTo);
      const bug = await bugService.getBugById(+id);
      if (!bug) throw new BadRequest("Bug not found");

      bug.title = title;
      bug.description = description;
      bug.status = status;
      bug.priority = priority;
      bug.type = type;

      // remove all assignedTo
      bug.assignedTo = [];
      // add new assignedTo
      newAssignedTo.forEach((user: User) => {
        bug.assignedTo.push(user);
      });

      await bugService.updateBug(bug);
      return ApiResponse.successResponse(res, bug);
    } catch (error) {
      console.log("error", error);
      return next(error);
    }
  }

  async deleteVersion(req: Request | any, res: Response, next: NextFunction) {
    const user = req.user;
    const { versionId } = req.params;
    try {
      const getVersion = await versionService.getVersionById(+versionId);
      if (!getVersion) {
        throw new BadRequest("Version not found");
      }
      await deleteFile(getVersion.liveUrl);
      await versionService.delete(getVersion);
      return ApiResponse.successResponse(res, { message: "Version deleted" });
    } catch (error) {
      return next(error);
    }
  }

  async updateProject(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const {
        title,
        description,
        appId,
        appUrl,
        appIcon,
        developer,
        developerId,
        developerEmail,
        firebaseAccount,
        privacyPolicyUrl,
        status,
        appType,
      } = req.body;
      const project = await projectsService.getProjectById(+projectId);
      if (!project) {
        throw new BadRequest("Project not found");
      }
      if (req.files?.appIcon as UploadedFile) {
        await deleteFile(project.appIcon);
        const file = req.files?.appIcon as UploadedFile;
        project.appIcon = await fileUploader(file, "project/icon");
      }
      project.title = title || project.title;
      project.description = description || project.description;
      project.appId = appId || project.appId;
      project.appUrl = appUrl || project.appUrl;
      project.appIcon = appIcon || project.appIcon;
      project.developer = developer || project.developer;
      project.developerId = developerId || project.developerId;
      project.developerEmail = developerEmail || project.developerEmail;
      project.firebaseAccount = firebaseAccount || project.firebaseAccount;
      project.privacyPolicyUrl = privacyPolicyUrl || project.privacyPolicyUrl;
      project.status = status || project.status;
      project.appType = appType || project.appType;

      await projectsService.createOrUpdateProject(project);
      return ApiResponse.successResponse(res, project);
    } catch (error) {
      return next(error);
    }
  }
  async deleteBugImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { ImageId } = req.params;
      const bugImage = await bugService.getImageById(+ImageId);
      if (!bugImage) throw new BadRequest("Image not found");
      await deleteFile(ImageId);
      await bugService.deleteBugImage(bugImage);
      return ApiResponse.successResponse(res, { message: "Image deleted" });
    } catch (error) {
      return next(error);
    }
  }

  async addImageToBug(req: Request, res: Response, next: NextFunction) {
    try {
      const { bugId } = req.params;
      const bug = await bugService.getBugById(+bugId);
      if (!bug) throw new BadRequest("Bug not found");
      if (req.files?.images as UploadedFile) {
        const file = req.files?.images as UploadedFile;
        const src = await fileUploader(file, "project/bug/image");
        const bugImage = BugImage.create({
          bug,
          src,
        });
        await bugService.createBugImage(bugImage);
        const newBugImage = await bugService.getImageById(bugImage.id);
        return ApiResponse.successResponse(res, newBugImage);
      } else throw new BadRequest("No image provided");
    } catch (error) {
      return next(error);
    }
  }
  async createBug(req: Request | any, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const {
        title,
        description,
        status,
        priority,
        type,
        assignedTo,
        versionId,
        projectId,
      } = req.body;
      if (
        !versionId ||
        !projectId ||
        !title ||
        !description ||
        !status ||
        !priority ||
        !type
      ) {
        throw new BadRequest("Fields are Missing or Invalid");
      }

      const version = await versionService.getVersionById(+versionId);
      if (!version) throw new BadRequest("version not found");
      const project = await projectsService.getProjectById(+projectId);
      if (!project) throw new BadRequest("Project not found");

      const newAssignedTo = JSON.parse(assignedTo);
      const bug = Bug.create({
        title,
        description,
        status,
        priority,
        type,
        reportedBy: user,
        assignedTo: newAssignedTo,
        version,
        project,
      });
      if (req.files?.images as UploadedFile) {
        const file = req.files?.images as UploadedFile;
        const src = await fileUploader(file, "project/bug/image");
        const bugImage = BugImage.create({
          bug,
          src,
        });
        await bugService.createBugImage(bugImage);
      }
      const newBug = await bugService.createBug(bug);
      return ApiResponse.successResponse(res, newBug);
    } catch (error) {
      console.log("error", error);
      return next(error);
    }
  }
}

export default new ProjectsController();
