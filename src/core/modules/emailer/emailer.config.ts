export interface IEmailerConfig {
  name: string;
  sender: string;
  authUser: string;
  authPassword: string;
  service?: string;
  rejectUnauthorized?: boolean;
  secure?: boolean;
}
