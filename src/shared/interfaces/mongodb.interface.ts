import { IEntityQuery } from "@shared/types";
import { Model, QueryFilter, Schema } from "mongoose";
import { IPaginationResponse } from "./pagination.interface";

export interface IMongodbDocument {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}

export interface IMongodbRecord {
  property: string;
  value: any;
}

export interface IMongodbRepository<T> {
  onModuleInit(): Promise<void>;
  find(entityQuery?: IEntityQuery<any>): Promise<any[] | IPaginationResponse<any>>;
  findOne(value: any, property: string): Promise<any | undefined>;
  save(value: Partial<any>): Promise<any | undefined>;
  updateOne(_id: string, value: Partial<any>): Promise<any | undefined>;
  updateMany(filter: QueryFilter<any>, update: Partial<any>): Promise<number>;
  deleteOne(_id: string): Promise<boolean>;
  deleteMany(filter: QueryFilter<any>): Promise<number>;
  getModel(model: string, schema: Schema<T>, collection: string): Model<T> | undefined;
  setModelIndexes(): Promise<void>;
}