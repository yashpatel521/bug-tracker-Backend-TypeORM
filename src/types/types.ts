import { Request } from "express";
import { User } from "../entity/user.entity";

export type AuthRequest = Request & { user?: User };

export type RequestError = Error & {
  code: number;
};
export type dbType = "mysql" | "postgres";

export type userStatus = "active" | "inactive";
// export type ID = number | string;
