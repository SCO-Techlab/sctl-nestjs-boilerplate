import { registerAs } from '@nestjs/config';
import { MAGIC_STRINGS } from '@shared/constants';

export const EMAILER_ENV_CONFIG = registerAs('emailer', () => ({
  name: process.env.EMAILER_NAME || MAGIC_STRINGS.DEFAULT,
  sender: process.env.EMAILER_SENDER || MAGIC_STRINGS.EMPTY_STRING,
  authUser: process.env.EMAILER_AUTH_USER || MAGIC_STRINGS.EMPTY_STRING,
  authPassword: process.env.EMAILER_AUTH_PASSWORD || MAGIC_STRINGS.EMPTY_STRING,
  service: process.env.EMAILER_SERVICE || MAGIC_STRINGS.EMPTY_STRING,
  rejectUnauthorized: process.env.EMAILER_REJECT_UNAUTHORIZED === MAGIC_STRINGS.TRUE ? true : false,
  secure: process.env.EMAILER_SECURE === MAGIC_STRINGS.TRUE ? true : false,
}));
