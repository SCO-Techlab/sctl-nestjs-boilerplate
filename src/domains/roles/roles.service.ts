import { LoggerService } from "@core/logger";
import { formatMongodbError, MongodbRepository } from "@core/mongodb";
import { MAGIC_NUMBERS } from "@core/shared/constants";
import { IMongodbRecord, IMongodbRepository, IPaginationResponse } from "@core/shared/interfaces";
import { EntityQuery } from "@core/shared/types";
import { PermissionsRepository } from "@domains/permissions";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { COLLECTIONS } from "@shared/constants";
import { IPermission, IRole } from "@shared/interfaces";
import { Model, QueryFilter } from "mongoose";
import { RoleCreateDto, RoleUpdateDto } from "./roles.dto";
import { ROLES_SCHEMA } from "./roles.schema";

@Injectable()
export class RolesService implements IMongodbRepository<IRole> {

  private RoleModel: Model<IRole>;

  constructor(
    private loggerService: LoggerService,
    private mongodbRepository: MongodbRepository,
    private permissionsRepository: PermissionsRepository
  ) { }

  async onModuleInit(): Promise<void> {
    try {
      this.RoleModel = this.mongodbRepository.getModel(COLLECTIONS.ROLES.MODEL, ROLES_SCHEMA, COLLECTIONS.ROLES.COLLECTION);
      await this.mongodbRepository.setModelIndexes(this.RoleModel);
    } catch (error) {
      this.loggerService.error(`[RolesService] onModuleInit -> Error: ${error}`);
    }
  }

  async find(entityQuery?: EntityQuery<IRole>): Promise<IRole[] | IPaginationResponse<IRole>> {
    try {
      return await this.mongodbRepository.find<IRole>(this.RoleModel, entityQuery);
    } catch (error) {
      throw formatMongodbError(error, 'RolesService', 'find', this.loggerService);
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<IRole | undefined> {
    const record: IMongodbRecord = { property, value };
    try {
      return await this.mongodbRepository.findOne<IRole>(this.RoleModel, record);
    } catch (error) {
      throw formatMongodbError(error, 'RolesService', 'findOne', this.loggerService);
    }
  }

  async save(role: RoleCreateDto): Promise<IRole | undefined> {
    const permissions: IPermission[] = role.permissions && role.permissions.length > MAGIC_NUMBERS.N_0
      ? await this.resolvePermissions(role.permissions.map(_id => _id))
      : [];

    const value: Partial<IRole> = {
      name: role.name,
      permissions
    };

    try {
      return await this.mongodbRepository.save<IRole>(this.RoleModel, value);
    } catch (error) {
      throw formatMongodbError(error, 'RolesService', 'save', this.loggerService);
    }
  }

  async updateOne(_id: string, role: RoleUpdateDto): Promise<IRole> {
    const record: IMongodbRecord = { property: '_id', value: _id };

    const permissions: IPermission[] = role.permissions && role.permissions.length > MAGIC_NUMBERS.N_0
      ? await this.resolvePermissions(role.permissions.map(_id => _id))
      : [];

    const value: Partial<IRole> = {
      name: role.name,
      permissions
    };

    try {
      const result: IRole = await this.mongodbRepository.updateOne<IRole>(this.RoleModel, record, value) as IRole;
      if (!result) {
        throw new NotFoundException(`Role not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'RolesService', 'updateOne', this.loggerService);
    }
  }

  async updateMany(filter: QueryFilter<IRole>, update: Partial<RoleUpdateDto>): Promise<number> {
    try {
      return await this.mongodbRepository.updateMany<IRole>(this.RoleModel, filter, update as Partial<IRole>);
    } catch (error) {
      throw formatMongodbError(error, 'RolesService', 'updateMany', this.loggerService);
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    const record: IMongodbRecord = { property: '_id', value: _id };
    try {
      const result: boolean = await this.mongodbRepository.deleteOne<IRole>(this.RoleModel, record);
      if (!result) {
        throw new NotFoundException(`Role not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'RolesService', 'deleteOne', this.loggerService);
    }
  }

  async deleteMany(filter: QueryFilter<IRole>): Promise<number> {
    try {
      return await this.mongodbRepository.deleteMany(this.RoleModel, filter);
    } catch (error) {
      throw formatMongodbError(error, 'RolesService', 'deleteMany', this.loggerService);
    }
  }

  private async resolvePermissions(permissionsIds: string[]): Promise<IPermission[]> {
    const _ids = [...new Set(permissionsIds.map(_id => _id))];
    const permissions = await this.permissionsRepository.find({ _id: { $in: _ids } } as any) as IPermission[];

    if (permissions.length !== _ids.length) {
      throw new BadRequestException('One or more permissions do not exist');
    }

    return permissions;
  }
}