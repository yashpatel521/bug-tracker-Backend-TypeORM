import { NextFunction, Request, Response } from "express";
import {
  getAppDetailsGoogle,
  getTopApps,
  searchAppsGoogle,
  suggestApps,
} from "../services/googlePlay.service";
import ApiResponse from "../Response/ApiResponse";
import { BadRequest } from "../Errors/errors";
import { AppDetails } from "../utils/types";
import { Project } from "../entity/project.entity";
import projectService from "../services/projects.service";
import userProjectService from "../services/userProject.service";
import { UserProject } from "../entity/userProject.entity";
import {
  getAppDetailsFromAppStore,
  searchAppsAppStore,
} from "../services/appStore.service";

export const getAppInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { appId } = req.params;

  try {
    // check appId is numeric
    let appDetails: AppDetails;
    if (Number.isInteger(+appId)) {
      appDetails = await getAppDetailsFromAppStore(appId);
    } else {
      appDetails = await getAppDetailsGoogle(appId);
    }
    if (!appDetails) throw new BadRequest("App not found", 404);

    return ApiResponse.successResponse(res, appDetails);
  } catch (error) {
    return next(error);
  }
};

export const searchAppInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { term } = req.query;

  if (!term) {
    throw new BadRequest("Search term is required", 400);
  }

  try {
    const googleSearchResult = await searchAppsGoogle(term as string);
    const updatedGoogleSearchResult = googleSearchResult.map((result: any) => {
      return {
        appId: result.appId,
        title: result.title,
        scoreText: result.scoreText,
        url: result.url,
        icon: result.icon,
        developer: result.developer,
        appType: "google",
      };
    });

    const appStoreSearchResult = await searchAppsAppStore(term as string);
    const updatedAppStoreSearchResult = appStoreSearchResult.map(
      (result: any) => {
        return {
          appId: result.id,
          title: result.title,
          scoreText: result.score.toFixed(2).toString(),
          url: result.url,
          icon: result.icon,
          developer: result.developer,
          appType: "apple",
        };
      }
    );

    return ApiResponse.successResponse(res, [
      ...updatedGoogleSearchResult,
      ...updatedAppStoreSearchResult,
    ]);
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

export const suggestAppInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { term } = req.query;

  if (!term) {
    throw new BadRequest("Search term is required", 400);
  }

  try {
    const googleSearchResult = await suggestApps(term as string);
    const updatedGoogleSearchResult = googleSearchResult.map((result: any) => {
      return {
        ...result,
        appType: "google",
      };
    });
    return ApiResponse.successResponse(res, updatedGoogleSearchResult);
  } catch (error) {
    return next(error);
  }
};

export const checkDailyStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let results;
    results = await projectService.getAllProjects();
    for (const project of results) {
      if (project.appId)
        await projectService.addDailyStatsAndUpdateProject(project);
    }

    return ApiResponse.successResponse(res, results);
  } catch (error) {
    return next(error);
  }
};

export const topApp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const googleSearchResult = await getTopApps();
    const updatedGoogleSearchResult = googleSearchResult.map((result: any) => {
      return {
        ...result,
        appType: "google",
      };
    });
    return ApiResponse.successResponse(res, updatedGoogleSearchResult);
  } catch (error) {
    return next(error);
  }
};

export const addApp = async (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const { appId } = req.body;
    const checkProjectExists = await projectService.getProjectByAppId(appId);
    if (checkProjectExists) throw new BadRequest("Project already exists");
    let appDetails: AppDetails;
    if (Number.isInteger(+appId)) {
      appDetails = await getAppDetailsFromAppStore(appId);
    } else {
      appDetails = await getAppDetailsGoogle(appId);
    }
    if (!appDetails) throw new BadRequest("App not found", 404);
    const createProject = Project.create({
      ...appDetails,
      createdBy: user,
    });
    const project = await projectService.createOrUpdateProject(createProject);
    const userProject = await UserProject.create({
      user: user,
      project: project,
    });
    await userProjectService.create(userProject);
    return ApiResponse.successResponse(res, project);
  } catch (error) {
    return next(error);
  }
};
