export interface IAppConfig {
  environment: string;
  port: number;
  production: boolean;
  host: string;
  prefix: string;
  origin: string;
  pwdRecoveryExpiration: number;
  appName: string;
}