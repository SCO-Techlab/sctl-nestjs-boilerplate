import { QueryFilter } from "mongoose";
import { EntityQuery } from "../../types";
import { IPaginationResponse } from "../pagination.interface";

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
  find(entityQuery?: EntityQuery<any>): Promise<any[] | IPaginationResponse<any>>;
  findOne(value: any, property: string): Promise<any | undefined>;
  save(value: Partial<any>): Promise<any | undefined>;
  updateOne(_id: string, value: Partial<any>): Promise<any | undefined>;
  updateMany(filter: QueryFilter<any>, update: Partial<any>): Promise<number>;
  deleteOne(_id: string): Promise<boolean>;
  deleteMany(filter: QueryFilter<any>): Promise<number>;
  dtoToEntity(dto: any): Promise<T | undefined>;
}