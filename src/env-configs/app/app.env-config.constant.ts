import { registerAs } from '@nestjs/config';

export const APP_ENV_CONFIG = registerAs('app', () => ({
  environment: process.env.ENVIRONMENT ?? 'development',
  port: Number.parseInt(process.env.PORT ?? '3000', 10) ?? 3000,
  production: process.env.PRODUCTION === 'true' ? true : false,
  host: process.env.HOST ?? 'localhost',
}));
