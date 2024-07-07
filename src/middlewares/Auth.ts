import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import userService from "../services/user.service";
import { BadRequest } from "../Errors/errors";
import { AuthRequest } from "../utils/types";
import { TOKEN_SECRET } from "../utils/constant";

interface JWT_DECODE {
  id: number;
  iat: number;
  exp: number;
}

export const Auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader
      ? authHeader.includes("Bearer")
        ? authHeader.split(" ")[1]
        : null
      : null;
    if (!token) {
      throw new BadRequest("Unauthorized / no token found", 400);
    } else {
      const data = jwt.verify(token, TOKEN_SECRET!) as JWT_DECODE;

      const user = await userService.findById(data.id);

      if (!user) {
        throw new BadRequest("Unauthorized !");
      }

      req.user = user;

      next();
    }
  } catch (error) {
    next(error);
  }
};
