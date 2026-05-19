import { IMongodbDocument } from "@core/mongodb";
import { PERMISSION_TYPE } from "./permissions.enum";

export interface IPermission extends IMongodbDocument {
  name: string;
  type: PERMISSION_TYPE;
}

export interface IRequiredPermission {
  name: string;
  type: PERMISSION_TYPE;
}