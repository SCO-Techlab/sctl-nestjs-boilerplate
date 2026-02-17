import { registerAs } from '@nestjs/config';
import { MAGIC_NUMBERS, MAGIC_STRINGS } from '@shared/constants';

export const APP_ENV_CONFIG = registerAs('app', () => ({
  environment: process.env.ENVIRONMENT ?? MAGIC_STRINGS.DEVELOPMENT,
  port: Number.parseInt(process.env.PORT ?? `${MAGIC_NUMBERS.N_3005}`, MAGIC_NUMBERS.N_10) ?? MAGIC_NUMBERS.N_3005,
  production: process.env.PRODUCTION === MAGIC_STRINGS.TRUE ? true : false,
  host: process.env.HOST ?? MAGIC_STRINGS.LOCAL_HOST,
}));
