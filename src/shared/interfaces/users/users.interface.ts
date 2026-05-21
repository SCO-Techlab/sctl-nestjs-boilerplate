import { IGridfsFile, IMongodbDocument } from '@core/shared/interfaces';
import { Types } from 'mongoose';
import { IRole } from '../roles';

export interface IUser extends IMongodbDocument {
  email: string;
  password: string;
  userName?: string;
  personalName?: string;
  active: boolean;
  emailConfirmed?: boolean;
  emailConfirmedAt?: Date;
  role: Types.ObjectId | IRole;
  pwdRecoveryToken?: string;
  pwdRecoveryDate?: Date;
  avatar?: Types.ObjectId | IGridfsFile;
}