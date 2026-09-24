import { IGridfsFile } from '@core/gridfs';
import { IMongodbDocument } from '@core/mongodb';
import { Types } from 'mongoose';
import { IResidence } from '../residences';
import { ITenant } from '../tenants';

export interface IRoom extends IMongodbDocument {
  tenant: Types.ObjectId | ITenant;
  residence: Types.ObjectId | IResidence;
  name: string;
  beds: number;
  images?: Types.ObjectId[] | IGridfsFile[];
}
