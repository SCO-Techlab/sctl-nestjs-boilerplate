import { JWT_TOKEN_TYPE } from "@core/jwt";

export class IJwtConfig {
  secret: string;
  algorithm: string;
  signOptions: {
    expiresIn: string;
    issuer: string;
    audience: string | string[];
  };
  refresh?: {
    secret: string;
    expiresIn: string;
    issuer?: string;
    audience?: string | string[];
  }
}

export interface IJwtToken {
  accessToken: string;
  refreshToken: string;
  tokenType: JWT_TOKEN_TYPE;
}