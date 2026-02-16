import { registerAs } from '@nestjs/config';

export const APP_ENV_CONFIG = registerAs('app', () => ({
  ENVIRONMENT: process.env.ENVIRONMENT ?? 'development',
  PORT: Number.parseInt(process.env.PORT ?? '3000', 10) ?? 3000,
  PRODUCTION: process.env.PRODUCTION === 'true' ? true : false,
  HOST: process.env.HOST ?? 'localhost',
}));
