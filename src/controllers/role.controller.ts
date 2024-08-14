import { NextFunction, Request, Response } from "express";
import { Role } from "../entity/role.entity";
import ApiResponse from "../Response/ApiResponse";
import roleService from "../services/role.service";
import { BadRequest } from "../Errors/errors";
import { checkRoleAccess } from "../utils/commonFunction";

class RoleController {
  async create(req: Request | any, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!checkRoleAccess(user, ["admin"])) {
        throw new BadRequest("Access denied", 403);
      }
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

  async viewAll(req: Request | any, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!checkRoleAccess(user, ["admin"])) {
        throw new BadRequest("Access denied", 403);
      }
      const data = await roleService.getAllRoles();
      return ApiResponse.successResponse(res, data);
    } catch (error) {
      return next(error);
    }
  }
  async delete(req: Request | any, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!checkRoleAccess(user, ["admin"])) {
        throw new BadRequest("Access denied", 403);
      }
      const { id } = req.params;
      const role = await roleService.getRoleById(+id);
      if (!role) {
        throw new BadRequest("Role not found", 404);
      }
      await roleService.delete(role);
      return ApiResponse.successResponse(res, {
        message: "Role deleted successfully",
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new RoleController();
