import { LoggerService } from "@core/logger";
import { formatMongodbError, MongodbRepository } from "@core/mongodb";
import { IMongodbRecord, IMongodbRepository, IPaginationResponse } from "@core/shared/interfaces";
import { EntityQuery } from "@core/shared/types";
import { Injectable, NotFoundException } from "@nestjs/common";
import { COLLECTIONS } from "@shared/constants";
import { IPermission } from "@shared/interfaces";
import { Model, QueryFilter } from "mongoose";
import { PermissionCreateDto, PermissionUpdateDto } from "./permissions.dto";
import { PERMISSIONS_SCHEMA } from "./permissions.schema";

@Injectable()
export class PermissionsService implements IMongodbRepository<IPermission> {

  private PermissionModel: Model<IPermission>;

  constructor(
    private loggerService: LoggerService,
    private mongodbRepository: MongodbRepository
  ) { }

  async onModuleInit(): Promise<void> {
    this.PermissionModel = this.getModel() as Model<IPermission>;
    await this.setModelIndexes();
  }

  async find(entityQuery?: EntityQuery<IPermission>): Promise<IPermission[] | IPaginationResponse<IPermission>> {
    try {
      return await this.mongodbRepository.find<IPermission>(this.PermissionModel, entityQuery);
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'find', this.loggerService);
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<IPermission | undefined> {
    const record: IMongodbRecord = { property, value };
    try {
      return await this.mongodbRepository.findOne<IPermission>(this.PermissionModel, record);
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'findOne', this.loggerService);
    }
  }

  async save(newValue: PermissionCreateDto): Promise<IPermission | undefined> {
    const value: Partial<IPermission> = {
      name: newValue.name,
      type: newValue.type
    };

    try {
      return await this.mongodbRepository.save<IPermission>(this.PermissionModel, value);
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'save', this.loggerService);
    }
  }

  async updateOne(_id: string, updateValue: PermissionUpdateDto): Promise<IPermission | undefined> {
    const record: IMongodbRecord = { property: '_id', value: _id };

    const value: Partial<IPermission> = {
      name: updateValue.name,
      type: updateValue.type
    };

    try {
      const result: IPermission = await this.mongodbRepository.updateOne<IPermission>(this.PermissionModel, record, value) as IPermission;
      if (!result) {
        throw new NotFoundException(`Permission not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'updateOne', this.loggerService);
    }
  }

  async updateMany(filter: QueryFilter<IPermission>, update: Partial<PermissionUpdateDto>): Promise<number> {
    try {
      return await this.mongodbRepository.updateMany<IPermission>(this.PermissionModel, filter, update as Partial<IPermission>);
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'updateMany', this.loggerService);
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    const record: IMongodbRecord = { property: '_id', value: _id };
    try {
      const result: boolean = await this.mongodbRepository.deleteOne<IPermission>(this.PermissionModel, record);
      if (!result) {
        throw new NotFoundException(`Permission not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'deleteOne', this.loggerService);
    }
  }

  async deleteMany(filter: QueryFilter<IPermission>): Promise<number> {
    try {
      return await this.mongodbRepository.deleteMany(this.PermissionModel, filter);
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'deleteMany', this.loggerService);
    }
  }

  getModel(): Model<IPermission> | undefined {
    try {
      return this.mongodbRepository.getModel(
        COLLECTIONS.PERMISSIONS.MODEL,
        PERMISSIONS_SCHEMA,
        COLLECTIONS.PERMISSIONS.COLLECTION
      );
    } catch (error) {
      this.loggerService.error(`[PermissionsService] getModel -> Error: ${error}`);
      return undefined;
    }
  }

  async setModelIndexes(): Promise<void> {
    try {
      this.mongodbRepository.setModelIndexes(this.PermissionModel);
    } catch (error) {
      this.loggerService.error(`[PermissionsService] setModelIndexes -> Error: ${error}`);
    }
  }
}
