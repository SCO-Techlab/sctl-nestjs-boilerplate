import { IUser } from "@domains/users";
import { IMongodbDocument } from "@shared/interfaces";
import { Types } from "mongoose";

export interface ISession extends IMongodbDocument {
  user: Types.ObjectId | IUser;
  jti: string;
  expiresAt: Date;
  isRevoked: boolean;
  revokedAt: Date | undefined;
}