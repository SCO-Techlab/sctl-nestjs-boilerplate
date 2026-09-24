import { IGridfsFile } from '@core/gridfs';
import { IMongodbDocument } from '@core/mongodb';
import { Types } from 'mongoose';
import { ITenant } from '../tenants';

export interface IResidence extends IMongodbDocument {
  tenant: Types.ObjectId | ITenant;
  street: string;
  number: string;
  flat?: string;
  door?: string;
  city: string;
  province: string;
  postalCode: string;
  cadastre?: string;
  description?: string;
  images?: Types.ObjectId[] | IGridfsFile[];
}
