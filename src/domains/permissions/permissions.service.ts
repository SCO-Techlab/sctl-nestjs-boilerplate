import { MongodbRepository } from "@modules/mongodb";
import { Injectable, NotFoundException } from "@nestjs/common";
import { MONGODB_CONSTANTS } from "@shared/constants";
import { formatMongodbError } from "@shared/helpers";
import { IMongodbRecord, IMongodbRepository, IPaginationResponse } from "@shared/interfaces";
import { IEntityQuery } from "@shared/types";
import { Model, QueryFilter } from "mongoose";
import { PermissionCreateDto, PermissionUpdateDto } from "./permissions.dto";
import { IPermission } from "./permissions.interface";
import { PERMISSIONS_SCHEMA } from "./permissions.schema";

@Injectable()
export class PermissionsService implements IMongodbRepository<IPermission> {

  private PermissionModel: Model<IPermission>;

  constructor(
    private mongodbRepository: MongodbRepository
  ) { }

  async onModuleInit(): Promise<void> {
    this.PermissionModel = this.getModel() as Model<IPermission>;
    await this.setModelIndexes();
  }

  async find(entityQuery?: IEntityQuery<IPermission>): Promise<IPermission[] | IPaginationResponse<IPermission>> {
    try {
      return await this.mongodbRepository.find<IPermission>(this.PermissionModel, entityQuery);
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'find');
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<IPermission | undefined> {
    const record: IMongodbRecord = { property, value };
    try {
      return await this.mongodbRepository.findOne<IPermission>(this.PermissionModel, record);
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'findOne');
    }
  }

  async save(newValue: PermissionCreateDto): Promise<IPermission | undefined> {
    const value: Partial<IPermission> = {
      name: newValue.name,
      type: newValue.type,
      extension: newValue.extension ?? {}
    };

    try {
      return await this.mongodbRepository.save<IPermission>(this.PermissionModel, value);
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'save');
    }
  }

  async updateOne(_id: string, updateValue: PermissionUpdateDto): Promise<IPermission | undefined> {
    const record: IMongodbRecord = { property: '_id', value: _id };

    const value: Partial<IPermission> = {
      name: updateValue.name,
      type: updateValue.type,
      extension: updateValue.extension ?? {},
    };

    try {
      const result: IPermission = await this.mongodbRepository.updateOne<IPermission>(this.PermissionModel, record, value) as IPermission;
      if (!result) {
        throw new NotFoundException(`Permission not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'updateOne');
    }
  }

  async updateMany(filter: QueryFilter<IPermission>, update: Partial<PermissionUpdateDto>): Promise<number> {
    try {
      return await this.mongodbRepository.updateMany<IPermission>(this.PermissionModel, filter, update as Partial<IPermission>);
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'updateMany');
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
      throw formatMongodbError(error, 'PermissionsService', 'deleteOne');
    }
  }

  async deleteMany(filter: QueryFilter<IPermission>): Promise<number> {
    try {
      return await this.mongodbRepository.deleteMany(this.PermissionModel, filter);
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'deleteMany');
    }
  }

  getModel(): Model<IPermission> | undefined {
    try {
      return this.mongodbRepository.getModel(
        MONGODB_CONSTANTS.PERMISSIONS.MODEL,
        PERMISSIONS_SCHEMA,
        MONGODB_CONSTANTS.PERMISSIONS.COLLECTION
      );
    } catch (error) {
      console.error(`[PermissionsService] getModel -> Error: ${error}`);
      return undefined;
    }
  }

  async setModelIndexes(): Promise<void> {
    try {
      this.mongodbRepository.setModelIndexes(this.PermissionModel);
    } catch (error) {
      console.error(`[PermissionsService] setModelIndexes -> Error: ${error}`);
    }
  }
}
