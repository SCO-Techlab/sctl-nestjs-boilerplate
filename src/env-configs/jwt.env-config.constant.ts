import { registerAs } from '@nestjs/config';

export const JWT_ENV_CONFIG = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || '',
  algorithm: process.env.JWT_ALGORITHM || '',
  signOptions: {
    expiresIn: process.env.JWT_SIGN_OPTIONS_EXPIRESIN || '',
    issuer: process.env.JWT_SIGN_OPTIONS_ISSUER || '',
    audience: process.env.JWT_SIGN_OPTIONS_AUDIENCE || '',
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET || '',
    expiresIn: process.env.JWT_REFRESH_EXPIRESIN || '',
    issuer: process.env.JWT_REFRESH_ISSUER || '',
    audience: process.env.JWT_REFRESH_AUDIENCE || '',
  }
}));
