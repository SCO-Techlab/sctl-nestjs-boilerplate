import { LoggerService } from "@core/logger";
import { formatMongodbError, MongodbRepository } from "@core/mongodb";
import { IMongodbRecord, IMongodbRepository, IPaginationResponse } from "@core/shared/interfaces";
import { EntityQuery } from "@core/shared/types";
import { PermissionsRepository } from "@domains/permissions";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { COLLECTIONS } from "@shared/constants";
import { IPermission, IRole } from "@shared/interfaces";
import { Model, QueryFilter } from "mongoose";
import { ROLES_SCHEMA } from "./roles.schema";

@Injectable()
export class RolesRepository implements IMongodbRepository<IRole> {

  private Model: Model<IRole>;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly mongodbRepository: MongodbRepository,
    private readonly permissionsRepository: PermissionsRepository
  ) { }

  async onModuleInit(): Promise<void> {
    try {
      this.Model = this.mongodbRepository.getModel(COLLECTIONS.ROLES.MODEL, ROLES_SCHEMA, COLLECTIONS.ROLES.COLLECTION);
      await this.mongodbRepository.setModelIndexes(this.Model);
    } catch (error) {
      this.loggerService.error(`[RolesRepository] onModuleInit -> Error: ${error}`);
    }
  }

  async find(entityQuery?: EntityQuery<IRole>): Promise<IRole[] | IPaginationResponse<IRole>> {
    try {
      return await this.mongodbRepository.find<IRole>(this.Model, entityQuery);
    } catch (error) {
      throw formatMongodbError(error, 'RolesRepository', 'find', this.loggerService);
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<IRole | undefined> {
    const record: IMongodbRecord = { property, value };
    try {
      return await this.mongodbRepository.findOne<IRole>(this.Model, record);
    } catch (error) {
      throw formatMongodbError(error, 'RolesRepository', 'findOne', this.loggerService);
    }
  }

  async save(newValue: IRole | Partial<IRole>): Promise<IRole | undefined> {
    try {
      return await this.mongodbRepository.save<IRole>(this.Model, newValue);
    } catch (error) {
      throw formatMongodbError(error, 'RolesRepository', 'save', this.loggerService);
    }
  }

  async updateOne(_id: string, updateValue: IRole | Partial<IRole>): Promise<IRole> {
    const record: IMongodbRecord = { property: '_id', value: _id };
    try {
      const result: IRole = await this.mongodbRepository.updateOne<IRole>(this.Model, record, updateValue) as IRole;
      if (!result) {
        throw new NotFoundException(`Role not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'RolesRepository', 'updateOne', this.loggerService);
    }
  }

  async updateMany(filter: QueryFilter<IRole>, update: IRole | Partial<IRole>): Promise<number> {
    try {
      return await this.mongodbRepository.updateMany<IRole>(this.Model, filter, update as Partial<IRole>);
    } catch (error) {
      throw formatMongodbError(error, 'RolesRepository', 'updateMany', this.loggerService);
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    const record: IMongodbRecord = { property: '_id', value: _id };
    try {
      const result: boolean = await this.mongodbRepository.deleteOne<IRole>(this.Model, record);
      if (!result) {
        throw new NotFoundException(`Role not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'RolesRepository', 'deleteOne', this.loggerService);
    }
  }

  async deleteMany(filter: QueryFilter<IRole>): Promise<number> {
    try {
      return await this.mongodbRepository.deleteMany(this.Model, filter);
    } catch (error) {
      throw formatMongodbError(error, 'RolesRepository', 'deleteMany', this.loggerService);
    }
  }

  async dtoToEntity(dto: any): Promise<IRole | undefined> {
    const keys: string[] = Object.keys(dto ?? {});
    if (!keys?.length) {
      return undefined;
    }

    const permissions: IPermission[] = [];
    if (dto?.permissions?.length) {
      for (const permissionId of dto.permissions) {
        const permission = await this.permissionsRepository.findOne(permissionId, '_id');
        if (!permission) {
          throw new BadRequestException(`Permission with ID ${permissionId} does not exist`);
        }
        permissions.push(permission);
      }
    }

    const entity: IRole = {
      _id: dto?._id ?? undefined,
      name: dto?.name ?? undefined,
      permissions,
      createdAt: dto?.createdAt ?? undefined,
      updatedAt: dto?.updatedAt ?? undefined,
      __v: dto?.__v ?? undefined
    };

    return entity;
  }
}