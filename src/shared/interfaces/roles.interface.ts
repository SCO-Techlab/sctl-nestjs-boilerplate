import { IMongodbDocument } from '@core/mongodb';
import { Types } from 'mongoose';
import { IPermission } from './permissions.interface';

export interface IRole extends IMongodbDocument {
  name: string;
  permissions?: Types.ObjectId[] | IPermission[];
}
