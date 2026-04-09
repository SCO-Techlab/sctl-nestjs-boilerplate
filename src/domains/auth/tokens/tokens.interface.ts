import { IUser } from "@domains/users";
import { IMongodbDocument } from "@shared/interfaces";
import { Types } from "mongoose";

export interface IToken extends IMongodbDocument {
  user: Types.ObjectId[] | IUser;
  jti: string;
  accessExpiresAt: Date;
  refreshExpiresAt?: Date;
  isRevoked: boolean;
  revokedAt: Date | undefined;
}