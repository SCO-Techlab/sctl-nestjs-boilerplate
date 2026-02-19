import { IMongodbDocument } from "@shared/interfaces";
import { PERMISSION_TYPE } from "./permissions.enum";

export interface IPermission extends IMongodbDocument {
  name: string;
  type: PERMISSION_TYPE;
  extension?: any;
}

export interface IRequiredPermission {
  name: string;
  type: PERMISSION_TYPE;
}