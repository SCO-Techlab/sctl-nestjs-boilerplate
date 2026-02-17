import { registerAs } from '@nestjs/config';
import { MAGIC_STRINGS } from '@shared/constants';

export const JWT_ENV_CONFIG = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || MAGIC_STRINGS.EMPTY_STRING,
  algorithm: process.env.JWT_ALGORITHM || MAGIC_STRINGS.EMPTY_STRING,
  signOptions: {
    expiresIn: process.env.JWT_SIGN_OPTIONS_EXPIRESIN || MAGIC_STRINGS.EMPTY_STRING,
    issuer: process.env.JWT_SIGN_OPTIONS_ISSUER || MAGIC_STRINGS.EMPTY_STRING,
    audience: process.env.JWT_SIGN_OPTIONS_AUDIENCE || MAGIC_STRINGS.EMPTY_STRING,
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET || MAGIC_STRINGS.EMPTY_STRING,
    expiresIn: process.env.JWT_REFRESH_EXPIRESIN || MAGIC_STRINGS.EMPTY_STRING,
    issuer: process.env.JWT_REFRESH_ISSUER || MAGIC_STRINGS.EMPTY_STRING,
    audience: process.env.JWT_REFRESH_AUDIENCE || MAGIC_STRINGS.EMPTY_STRING,
  }
}));
