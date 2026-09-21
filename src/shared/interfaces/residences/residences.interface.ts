import { IMongodbDocument } from '@core/mongodb';
import { Types } from 'mongoose';
import { ITenant } from '../tenants';

export interface IResidence extends IMongodbDocument {
  tenant: Types.ObjectId | ITenant;
  street: string;
  number: string;
  door: string;
  cadastre?: string;
  description?: string;
}
