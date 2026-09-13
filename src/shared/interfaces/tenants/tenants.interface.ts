import { IMongodbDocument } from "@core/mongodb";
import { Types } from "mongoose";
import { IUser } from "../users";

export interface ITenant extends IMongodbDocument {
  name: string;
  isActive: boolean;
  owner: Types.ObjectId | IUser;
  description?: string;
  members?: Types.ObjectId[] | IUser[];
}