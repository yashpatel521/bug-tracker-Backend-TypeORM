import { NextFunction, Request, Response } from "express";
import ApiResponse from "../Response/ApiResponse";
import { BadRequest } from "../Errors/errors";
import subRoleService from "../services/subRole.service";
import { SubRole } from "../entity/subRole.entity";
import roleService from "../services/role.service";

class SubRoleController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      var { name, roleId }: { name: string; roleId: number } = req.body;
      //check if role already exists

      const subRoleExist = await subRoleService.getSubRoleByName(name);
      if (subRoleExist) {
        throw new BadRequest("Sub Role already exists", 400);
      }
      const role = await roleService.getRoleById(roleId);
      if (!role) throw new BadRequest("Role not found", 400);
      let subRole = SubRole.create({
        name: name.toLowerCase(),
        role,
      });

      subRole = await subRoleService.create(subRole);

      return ApiResponse.successResponse(res, subRole);
    } catch (error) {
      return next(error);
    }
  }

  async viewAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await subRoleService.getAllSubRoles();
      return ApiResponse.successResponse(res, data);
    } catch (error) {
      return next(error);
    }
  }
}

export default new SubRoleController();
