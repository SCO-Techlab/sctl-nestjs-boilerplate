export interface IMongodbConfig {
  name: string;
  host: string;
  port: number;
  database: string;
  user?: string;
  pass?: string;
  authSource?: string;
  avoidConnection?: boolean;
}