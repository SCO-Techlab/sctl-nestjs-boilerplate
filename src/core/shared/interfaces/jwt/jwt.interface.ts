import { JWT_TOKEN_TYPE } from "@core/jwt";

export interface IJwtToken {
  accessToken: string;
  refreshToken: string;
  tokenType: JWT_TOKEN_TYPE;
}