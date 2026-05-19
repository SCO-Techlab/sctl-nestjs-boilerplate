import { IUser } from "@domains/users";
import { IMongodbDocument } from "@shared/interfaces";
import { Types } from "mongoose";

export interface ISession extends IMongodbDocument {
  user: Types.ObjectId | IUser;
  accessJti: string;
  accessExpiresAt: Date;
  refreshJti?: string;
  refreshExpiresAt?: Date;
  isRevoked: boolean;
  isAccessRevoked?: boolean;
  isRefreshRevoked?: boolean;
  revokedAt?: Date;
}