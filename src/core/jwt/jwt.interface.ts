import { JWT_TOKEN_TYPE } from "./jwt.enum";

export interface IJwtToken {
  accessToken: string;
  refreshToken: string;
  tokenType: JWT_TOKEN_TYPE;
}