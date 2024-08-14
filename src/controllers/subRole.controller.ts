import { NextFunction, Request, Response } from "express";
import ApiResponse from "../Response/ApiResponse";
import { BadRequest } from "../Errors/errors";
import subRoleService from "../services/subRole.service";
import { SubRole } from "../entity/subRole.entity";
import roleService from "../services/role.service";
import { checkRoleAccess } from "../utils/commonFunction";

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

  async viewAll(req: Request | any, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!checkRoleAccess(user, ["admin"])) {
        throw new BadRequest("Access denied", 403);
      }
      const data = await subRoleService.getAllSubRoles();
      return ApiResponse.successResponse(res, data);
    } catch (error) {
      return next(error);
    }
  }
  async delete(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const subRole = await subRoleService.getSubRoleById(id);
      if (!subRole) throw new BadRequest("Sub Role not found", 404);
      await subRoleService.delete(subRole);
      return ApiResponse.successResponse(res, "Sub Role deleted successfully");
    } catch (error) {
      return next(error);
    }
  }
}

export default new SubRoleController();
