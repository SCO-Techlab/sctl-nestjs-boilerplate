import { registerAs } from '@nestjs/config';
import { MAGIC_NUMBERS } from '@shared/constants';

export const APP_ENV_CONFIG = registerAs('app', () => ({
  environment: process.env.ENVIRONMENT ?? 'development',
  port: Number.parseInt(process.env.PORT ?? `${MAGIC_NUMBERS.N_3005}`, MAGIC_NUMBERS.N_10) ?? MAGIC_NUMBERS.N_3005,
  production: process.env.PRODUCTION === 'true',
  httpsEnabled: process.env.HTTPS_ENABLED === 'true',
  host: process.env.HOST ?? 'localhost',
  prefix: process.env.PREFIX ?? '',
  origin: process.env.ORIGIN ?? '',
  pwdRecoveryExpiration: Number.parseInt(process.env.PWD_RECOVERY_EXPIRATION ?? `${MAGIC_NUMBERS.N_30}`, MAGIC_NUMBERS.N_10) ?? MAGIC_NUMBERS.N_30,
  appName: process.env.APP_NAME ?? 'Sctl Nestjs Boilerplate',
  langHeader: process.env.LANG_HEADER ?? '',
  certificatesPath: process.env.CERTIFICATES_PATH ?? '',
}));
