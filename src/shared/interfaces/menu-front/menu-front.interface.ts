import { IMongodbDocument } from "@core/shared/interfaces";
import { Types } from "mongoose";
import { IRole } from "../roles";

export interface IMenuFront extends IMongodbDocument {
  label?: string;
  separator?: boolean;
  icon?: string;
  routerLink?: string;
  items?: IMenuFront[] | null;
  roles?: Types.ObjectId[] | IRole[] | null;
  order: number;
}