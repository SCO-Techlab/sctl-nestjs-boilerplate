import { IMongodbDocument } from '@shared/interfaces';
import { Types } from 'mongoose';
import { IPermission } from '../permissions';

export interface IRole extends IMongodbDocument {
  name: string;
  permissions?: Types.ObjectId[] | IPermission[];
  extension?: any;
}
