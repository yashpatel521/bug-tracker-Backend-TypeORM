import { NextFunction, Request, Response } from "express";
import roleService from "../services/role.service";
import { User } from "../entity/user.entity";
import ApiResponse from "../Response/ApiResponse";
import userService from "../services/user.service";
import { BadRequest } from "../Errors/errors";
import { DeepPartial } from "typeorm";
import Middleware from "../middlewares/Middleware";
import * as bcrypt from "bcrypt";
import { checkRoleAccess, getJwt } from "../utils/commonFunction";
import subRoleService from "../services/subRole.service";
import { deleteFile, fileUploader } from "../utils/imageUpload";
import { UploadedFile } from "express-fileupload";

class UserController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        firstName,
        lastName,
        roleId,
        subRoleId,
        email,
        password,
        status,
      } = req.body;
      // add validation for the request body
      if (!firstName || !lastName || !email || !password || !status) {
        throw new BadRequest("Missing required fields", 400);
      }
      if (!email.match(/^\S+@\S+\.\S+$/)) {
        throw new BadRequest("Invalid email format", 400);
      }
      if (password.length < 8) {
        throw new BadRequest(
          "Password must be at least 8 characters long",
          400
        );
      }
      if (
        !password.match(
          /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/
        )
      ) {
        throw new BadRequest(
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        );
      }

      let checkEmailExists = await userService.findByEmail(email);
      if (checkEmailExists) {
        throw new BadRequest(`Email already exists ${email}`, 401);
      }

      let role = await roleService.getRoleById(+roleId);
      if (!role) throw new BadRequest("Role not found", 400);

      let subRole = await subRoleService.getSubRoleById(+subRoleId);
      if (!subRole) throw new BadRequest("Sub Role not found", 400);

      let image = req.files?.image as UploadedFile;
      let profile = "https://github.com/shadcn.png";
      if (image) {
        profile = await fileUploader(image, "user");
      }
      let user = User.create({
        firstName,
        lastName,
        role,
        subRole,
        email,
        password,
        status,
        profile,
      });

      user = await userService.create(user);

      return ApiResponse.successResponse(res, user);
    } catch (error) {
      return next(error);
    }
  }

  async viewAll(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { query, currentPage, sortBy, sortOrder } = req.query;
      const user = req.user;
      if (!checkRoleAccess(user, ["admin"])) {
        throw new BadRequest("Access denied", 403);
      }
      const data = await userService.findAll({
        query: query?.toString(),
        currentPage: currentPage?.toString() || "1",
        sortBy: sortBy?.toString(),
        sortOrder: sortOrder?.toString(),
      });

      return ApiResponse.successResponse(res, data);
    } catch (error) {
      return next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const user = await userService.findByEmail(email);
      if (!user) {
        throw new BadRequest("Invalid credentials", 401);
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new BadRequest("Invalid credentials", 401);
      }

      const jwt = getJwt(user);
      const filteredData: DeepPartial<User> = user;

      const data = {
        ...jwt,
        user: filteredData,
      };

      return ApiResponse.successResponse(res, data);
    } catch (error) {
      return next(error);
    }
  }
  async profile(req: Request | any, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const { id } = req.params;
      if (!user) throw new BadRequest("User not found", 404);
      const profile = await userService.getProfile(+id);
      return ApiResponse.successResponse(res, profile);
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  async passwordChange(req: Request | any, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const { oldPassword, newPassword } = req.body;
      if (!user) throw new BadRequest("User not found", 404);
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        throw new BadRequest("Invalid old password", 401);
      }
      if (newPassword.length < 8) {
        throw new BadRequest(
          "New password must be at least 8 characters long",
          400
        );
      }
      if (
        !newPassword.match(
          /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/
        )
      ) {
        throw new BadRequest(
          "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        );
      }
      user.password = await bcrypt.hash(newPassword, 10);
      await userService.updateProfile(user);
      return ApiResponse.successResponse(res, {
        message: "Password changed successfully",
      });
    } catch (error) {
      return next(error);
    }
  }
  async updateProfile(req: Request | any, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const { firstName, lastName, roleId, subRoleId, email, userId, status } =
        req.body;
      if (!userId) {
        throw new BadRequest("Missing required fields", 400);
      }
      const updateUser = await userService.findById(+userId);
      if (!updateUser) throw new BadRequest("User not found", 404);

      if (email) {
        if (!email.match(/^\S+@\S+\.\S+$/))
          throw new BadRequest("Invalid email format", 400);
        const checkEmailExists = await userService.findByEmail(email);
        if (checkEmailExists)
          throw new BadRequest(`Email already exists ${email}`);
        updateUser.email = email;
      }

      if (roleId) {
        const role = await roleService.getRoleById(+roleId);
        if (!role) throw new BadRequest("Role not found", 400);
        updateUser.role = role;
      }

      if (subRoleId) {
        const subRole = await subRoleService.getSubRoleById(+subRoleId);
        if (!subRole) throw new BadRequest("Sub Role not found", 400);
        updateUser.subRole = subRole;
      }

      if (firstName) updateUser.firstName = firstName;
      if (lastName) updateUser.lastName = lastName;
      if (status) updateUser.status = status;

      if (req.files?.image) {
        const image = req.files?.image as UploadedFile;
        await deleteFile(updateUser.profile);
        const profile = await fileUploader(image, "user");
        updateUser.profile = profile;
      }

      const newUpdateUser = await userService.updateProfile(updateUser);
      return ApiResponse.successResponse(res, newUpdateUser);
    } catch (error) {
      return next(error);
    }
  }
}

export default new UserController();
