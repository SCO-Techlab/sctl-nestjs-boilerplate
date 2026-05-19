import { IGridfsFile } from '@core/gridfs';
import { IMongodbDocument } from '@core/mongodb';
import { IRole } from '@domains/roles';
import { Types } from 'mongoose';

export interface IUser extends IMongodbDocument {
  email: string;
  password: string;
  userName?: string;
  personalName?: string;
  active: boolean;
  emailConfirmed?: boolean;
  emailConfirmedAt?: Date;
  role: Types.ObjectId[] | IRole;
  pwdRecoveryToken?: string;
  pwdRecoveryDate?: Date;
  avatar?: Types.ObjectId | IGridfsFile;
}