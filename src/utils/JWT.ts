import { User } from "../entity/user.entity";
import {
  REFRESH_TOKEN_SECRET,
  refreshTokenSecretExpire,
  TOKEN_SECRET,
  tokenSecretExpire,
} from "../utils/constant";
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
