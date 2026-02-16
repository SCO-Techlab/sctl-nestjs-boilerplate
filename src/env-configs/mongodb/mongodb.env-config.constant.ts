import { registerAs } from '@nestjs/config';

export const MONGODB_ENV_CONFIG = registerAs('mongodb', () => ({
  name: process.env.MONGODB_NAME || 'default',
  host: process.env.MONGODB_HOST || 'localhost',
  port: Number.parseInt(process.env.MONGODB_PORT || '27017', 10) || 27017,
  database: process.env.MONGODB_DATABASE,
  user: process.env.MONGODB_USER || '',
  password: process.env.MONGODB_PASSWORD || '',
  authSource: process.env.MONGODB_AUTH_SOURCE || '',
  avoidConnection: process.env.MONGODB_AVOID_CONNECTION === 'true' ? true : false,
}));
