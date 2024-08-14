import { User } from "../entity/user.entity";
import { BadRequest } from "../Errors/errors";
import {
  REFRESH_TOKEN_SECRET,
  refreshTokenSecretExpire,
  TOKEN_SECRET,
  tokenSecretExpire,
} from "./constant";
import jwt from "jsonwebtoken";
export function getJwt(user: User) {
  const data = {
    id: user.id,
  };

  const accessToken = jwt.sign(data, TOKEN_SECRET!, {
    expiresIn: tokenSecretExpire,
  });

  const refreshToken = jwt.sign(data, REFRESH_TOKEN_SECRET!, {
    expiresIn: refreshTokenSecretExpire,
  });

  return { accessToken, refreshToken };
}

export function checkRoleAccess(user: User, type: string[]) {
  if (!user.role || !user.subRole) {
    throw new BadRequest("Role must be specified");
  }
  if (
    type.includes(user.role.name.toLocaleLowerCase()) ||
    type.includes(user.subRole.name.toLocaleLowerCase())
  ) {
    return true;
  } else return false;
}
