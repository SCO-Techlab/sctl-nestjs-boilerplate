import { IMongodbDocument } from "@core/shared/interfaces";
import { PERMISSION_TYPE } from "@shared/enums";

export interface IPermission extends IMongodbDocument {
  name: string;
  type: PERMISSION_TYPE;
}

export interface IRequiredPermission {
  name: string;
  type: PERMISSION_TYPE;
}