export interface IAppConfig {
  environment: string;
  port: number;
  production: boolean;
  httpsEnabled: boolean;
  host: string;
  prefix: string;
  origin: string;
  pwdRecoveryExpiration: number;
  appName: string;
  langHeader: string;
  certificatesPath: string;
}