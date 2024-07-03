import { NextFunction, Request, Response } from "express";
import { Role } from "../entity/role.entity";
import myDataSource from "../app-data-source";
import { User } from "../entity/user.entity";
import ApiResponse from "../Response/ApiResponse";
import roleService from "../services/role.service";

class RoleController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      var { type }: { type: string } = req.body;
      //check if role already exists
      await roleService.checkRoleExists(type);

      let role = Role.create({
        name: type.toLowerCase(),
      });

      role = await roleService.create(role);

      return ApiResponse.successResponse(res, role);
    } catch (error) {
      return next(error);
    }
  }

  async viewAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await myDataSource
        .getRepository(Role)
        .createQueryBuilder("role")
        .getMany();

      return ApiResponse.successResponse(res, data);
    } catch (error) {
      return next(error);
    }
  }
}

export default new RoleController();
