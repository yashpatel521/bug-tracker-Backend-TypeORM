import { NextFunction, Request, Response } from "express";
import {
  getAppDetails,
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

export const getAppInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { appId } = req.params;

  try {
    const user = await userService.findById(4);

    if (user) {
      const appDetails: AppDetails = await getAppDetails(appId);
      if (!appDetails) throw new BadRequest("App not found", 404);
      // const createProject = Project.create({
      //   ...appDetails,
      //   createdBy: user,
      // });
      // const project = await projectService.createProject(createProject);

      return ApiResponse.successResponse(res, appDetails);
    } else {
      throw new BadRequest("User not found", 400);
    }
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

// Utility function to get random users
function getRandomUsers(users: User[], count: number): User[] {
  const shuffled = users.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
