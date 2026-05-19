import { IMongodbDocument } from "@core/mongodb";
import { IRole } from "@domains/roles";
import { Types } from "mongoose";

export interface IMenuFront extends IMongodbDocument {
  label?: string;
  separator?: boolean;
  icon?: string;
  routerLink?: string;
  items?: IMenuFront[] | null;
  roles?: Types.ObjectId[] | IRole[] | null;
  order: number;
}