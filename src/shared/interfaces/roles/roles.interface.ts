import { IMongodbDocument } from '@core/mongodb';
import { Types } from 'mongoose';
import { IPermission } from '../permissions';

export interface IRole extends IMongodbDocument {
  name: string;
  permissions?: Types.ObjectId[] | IPermission[];
}
