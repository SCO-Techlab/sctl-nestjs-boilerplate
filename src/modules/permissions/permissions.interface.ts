import { IMongodbDocument } from "@shared/interfaces";

export interface IPermission extends IMongodbDocument {
  name: string;
  extension?: any;
}
