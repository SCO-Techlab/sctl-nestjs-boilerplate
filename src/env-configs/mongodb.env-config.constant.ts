import { registerAs } from '@nestjs/config';
import { MAGIC_NUMBERS, MAGIC_STRINGS } from '@shared/constants';

export const MONGODB_ENV_CONFIG = registerAs('mongodb', () => ({
  name: process.env.MONGODB_NAME || MAGIC_STRINGS.DEFAULT,
  host: process.env.MONGODB_HOST || MAGIC_STRINGS.LOCAL_HOST,
  port: Number.parseInt(process.env.MONGODB_PORT || `${MAGIC_NUMBERS.N_27017}`, MAGIC_NUMBERS.N_10) || MAGIC_NUMBERS.N_27017,
  database: process.env.MONGODB_DATABASE,
  user: process.env.MONGODB_USER || MAGIC_STRINGS.EMPTY_STRING,
  password: process.env.MONGODB_PASSWORD || MAGIC_STRINGS.EMPTY_STRING,
  authSource: process.env.MONGODB_AUTH_SOURCE || MAGIC_STRINGS.EMPTY_STRING,
  avoidConnection: process.env.MONGODB_AVOID_CONNECTION === MAGIC_STRINGS.TRUE ? true : false,
}));
