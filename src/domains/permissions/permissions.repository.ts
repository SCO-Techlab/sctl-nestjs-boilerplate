import { LoggerService } from "@core/logger";
import { formatMongodbError, MongodbRepository } from "@core/mongodb";
import { IMongodbRecord, IMongodbRepository, IPaginationResponse } from "@core/shared/interfaces";
import { EntityQuery } from "@core/shared/types";
import { Injectable, NotFoundException } from "@nestjs/common";
import { COLLECTIONS } from "@shared/constants";
import { IPermission } from "@shared/interfaces";
import { Model, QueryFilter } from "mongoose";
import { PERMISSIONS_SCHEMA } from "./permissions.schema";

@Injectable()
export class PermissionsRepository implements IMongodbRepository<IPermission> {

  private Model: Model<IPermission>;

  constructor(
    private loggerService: LoggerService,
    private mongodbRepository: MongodbRepository
  ) { }

  async onModuleInit(): Promise<void> {
    try {
      this.Model = this.mongodbRepository.getModel(COLLECTIONS.PERMISSIONS.MODEL, PERMISSIONS_SCHEMA, COLLECTIONS.PERMISSIONS.COLLECTION);
      await this.mongodbRepository.setModelIndexes(this.Model);
    } catch (error) {
      this.loggerService.error(`[PermissionsRepository] onModuleInit -> Error: ${error}`);
    }
  }

  async find(entityQuery?: EntityQuery<IPermission>): Promise<IPermission[] | IPaginationResponse<IPermission>> {
    try {
      return await this.mongodbRepository.find<IPermission>(this.Model, entityQuery);
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsRepository', 'find', this.loggerService);
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<IPermission | undefined> {
    const record: IMongodbRecord = { property, value };
    try {
      return await this.mongodbRepository.findOne<IPermission>(this.Model, record);
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsRepository', 'findOne', this.loggerService);
    }
  }

  async save(newValue: IPermission | Partial<IPermission>): Promise<IPermission | undefined> {
    const value: Partial<IPermission> = {
      name: newValue.name,
      type: newValue.type
    };

    try {
      return await this.mongodbRepository.save<IPermission>(this.Model, value);
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsRepository', 'save', this.loggerService);
    }
  }

  async updateOne(_id: string, updateValue: IPermission | Partial<IPermission>): Promise<IPermission | undefined> {
    const record: IMongodbRecord = { property: '_id', value: _id };

    const value: Partial<IPermission> = {
      name: updateValue.name,
      type: updateValue.type
    };

    try {
      const result: IPermission = await this.mongodbRepository.updateOne<IPermission>(this.Model, record, value) as IPermission;
      if (!result) {
        throw new NotFoundException(`Permission not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsRepository', 'updateOne', this.loggerService);
    }
  }

  async updateMany(filter: QueryFilter<IPermission>, update: IPermission | Partial<IPermission>): Promise<number> {
    try {
      return await this.mongodbRepository.updateMany<IPermission>(this.Model, filter, update as Partial<IPermission>);
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsRepository', 'updateMany', this.loggerService);
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    const record: IMongodbRecord = { property: '_id', value: _id };
    try {
      const result: boolean = await this.mongodbRepository.deleteOne<IPermission>(this.Model, record);
      if (!result) {
        throw new NotFoundException(`Permission not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsRepository', 'deleteOne', this.loggerService);
    }
  }

  async deleteMany(filter: QueryFilter<IPermission>): Promise<number> {
    try {
      return await this.mongodbRepository.deleteMany(this.Model, filter);
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsRepository', 'deleteMany', this.loggerService);
    }
  }
}
