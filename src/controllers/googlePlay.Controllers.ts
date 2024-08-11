import { NextFunction, Request, Response } from "express";
import {
  getAppDetails,
  getTopApps,
  searchApps,
  suggestApps,
} from "../services/googlePlay.service";
import ApiResponse from "../Response/ApiResponse";
import { BadRequest } from "../Errors/errors";
import userService from "../services/user.service";
import { AppDetails } from "../utils/types";
import { Project } from "../entity/project.entity";
import projectService from "../services/projects.service";
import { User } from "../entity/user.entity";
import userProjectService from "../services/userProject.service";
import { UserProject } from "../entity/userProject.entity";

export const getAppInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { appId } = req.params;

  try {
    const appDetails: AppDetails = await getAppDetails(appId);
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
    const results = await searchApps(term as string);
    return ApiResponse.successResponse(res, results);
  } catch (error) {
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
    const results = await suggestApps(term as string);
    return ApiResponse.successResponse(res, results);
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
    const topApps = await getTopApps();
    return ApiResponse.successResponse(res, topApps);
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

    const appDetails: AppDetails = await getAppDetails(appId);
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
