import { IUser } from "@domains/users";
import { IMongodbDocument } from "@shared/interfaces";
import { Types } from "mongoose";

export interface IRefreshToken extends IMongodbDocument {
  user: Types.ObjectId[] | IUser;
  tokenHash: string;
  expiresAt: Date;
  isRevoked: boolean;
  revokedAt: Date | undefined;
}