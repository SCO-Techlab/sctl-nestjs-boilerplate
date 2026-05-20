import { MAGIC_NUMBERS } from '@core/shared/constants';
import { registerAs } from '@nestjs/config';

export const MONGODB_ENV = registerAs('mongodb', () => ({
  name: process.env.MONGODB_NAME || 'default',
  host: process.env.MONGODB_HOST || 'localhost',
  port: Number.parseInt(process.env.MONGODB_PORT || `${MAGIC_NUMBERS.N_27017}`, MAGIC_NUMBERS.N_10) || MAGIC_NUMBERS.N_27017,
  database: process.env.MONGODB_DATABASE,
  user: process.env.MONGODB_USER || '',
  password: process.env.MONGODB_PASSWORD || '',
  authSource: process.env.MONGODB_AUTH_SOURCE || '',
  avoidConnection: process.env.MONGODB_AVOID_CONNECTION === 'true'
}));
