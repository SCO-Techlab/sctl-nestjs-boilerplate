import { IMongodbDocument } from "@core/mongodb";
import { PERMISSION_TYPE } from "@domains/permissions";

export interface IPermission extends IMongodbDocument {
  name: string;
  type: PERMISSION_TYPE;
}

export interface IRequiredPermission {
  name: string;
  type: PERMISSION_TYPE;
}