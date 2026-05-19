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