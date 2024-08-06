import { NextFunction, Request, Response } from "express";
import ApiResponse from "../Response/ApiResponse";
import projectsService from "../services/projects.service";
import { BadRequest } from "../Errors/errors";
import { UserProject } from "../entity/userProject.entity";
import userProjectService from "../services/userProject.service";
import { fileUploader } from "../utils/imageUpload";
import { UploadedFile } from "express-fileupload";
import versionService from "../services/version.service";
import { Version } from "../entity/version.entity";
import pinProjectService from "../services/pinProject.service";
import { PinnedProject } from "../entity/pinnedProject.entity";
import { checkRoleAccess } from "../utils/commonFunction";
import { Project } from "../entity/project.entity";
import bugService from "../services/bug.service";

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
      } = req.body;
      const user = req.user;
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
      };

      if (req.files?.file as UploadedFile) {
        const file = req.files?.file as UploadedFile;
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

  async addUserToProject(
    req: Request | any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;
      const { projectId, userIds } = req.body;
      let usersInProject = await userProjectService.getUsersInProject(
        +projectId
      );
      const userArray = usersInProject.map((item) => item.user.id);
      const usersToAdd = userIds.filter(
        (id: number) => !userArray.includes(id)
      );

      if (usersToAdd.length === 0) {
        throw new BadRequest("User already in project");
      }

      for (const user of usersToAdd) {
        const userProjectAdd = await UserProject.create({
          user: { id: user },
          project: { id: +projectId },
        });
        await userProjectService.create(userProjectAdd);
      }

      return ApiResponse.successResponse(res, usersToAdd);
    } catch (error) {
      return next(error);
    }
  }
  async deleteUserToProject(
    req: Request | any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;
      const { projectId, userIds } = req.body;

      for (const userId of userIds) {
        await userProjectService.delete(+projectId, +userId);
      }

      return ApiResponse.successResponse(res, { message: "User deleted" });
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

  async getLastVersionNumber(
    req: Request | any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { projectId } = req.params;
      const project = await projectsService.getProjectById(+projectId);
      if (!project) {
        throw new BadRequest("Project not found");
      }
      const lastVersion = await versionService.getLastVersionNumber(+projectId);
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
          sortBy: sortBy?.toString(),
          sortOrder: sortOrder?.toString(),
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
      const { bugId } = req.params;
      const { id, title, description, status, priority, type, assignedTo } =
        req.body;
      const newAssignedTo = JSON.parse(assignedTo);
      console.log(
        id,
        title,
        description,
        status,
        priority,
        type,
        newAssignedTo
      );
      console.log(req.files);
      console.log(req.images);
      // console.log(body);
      // await bugService.update(bug);
      return ApiResponse.successResponse(res, req.body);
    } catch (error) {
      return next(error);
    }
  }
}

export default new ProjectsController();
