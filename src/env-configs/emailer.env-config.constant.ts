import { registerAs } from '@nestjs/config';

export const EMAILER_ENV_CONFIG = registerAs('emailer', () => ({
  name: process.env.EMAILER_NAME || 'default',
  sender: process.env.EMAILER_SENDER || '',
  authUser: process.env.EMAILER_AUTH_USER || '',
  authPassword: process.env.EMAILER_AUTH_PASSWORD || '',
  service: process.env.EMAILER_SERVICE || '',
  rejectUnauthorized: process.env.EMAILER_REJECT_UNAUTHORIZED === 'true',
  secure: process.env.EMAILER_SECURE === 'true',
}));
