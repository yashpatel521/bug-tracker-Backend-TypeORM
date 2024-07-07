import { NextFunction, Request, Response } from "express";
import { Role } from "../entity/role.entity";
import ApiResponse from "../Response/ApiResponse";
import roleService from "../services/role.service";
import { BadRequest } from "../Errors/errors";

class RoleController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      var { name }: { name: string } = req.body;
      //check if role already exists

      const roleExist = await roleService.getRoleByName(name);
      if (roleExist) {
        throw new BadRequest("Role already exists", 400);
      }
      let role = Role.create({
        name: name.toLowerCase(),
      });

      role = await roleService.create(role);

      return ApiResponse.successResponse(res, role);
    } catch (error) {
      return next(error);
    }
  }

  async viewAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await roleService.getAllRoles();
      return ApiResponse.successResponse(res, data);
    } catch (error) {
      return next(error);
    }
  }
}

export default new RoleController();
