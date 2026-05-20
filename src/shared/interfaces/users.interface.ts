import { IGridfsFile } from '@core/gridfs';
import { IMongodbDocument } from '@core/mongodb';
import { Types } from 'mongoose';
import { IRole } from './roles.interface';

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