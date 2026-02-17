import { IMongodbDocument } from '@shared/interfaces';
import { IPermission } from '../permissions';

export interface IRole extends IMongodbDocument {
  name: string;
  permissions?: IPermission[];
  extension?: any;
}
