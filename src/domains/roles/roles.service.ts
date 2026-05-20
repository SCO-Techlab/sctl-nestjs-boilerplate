import { formatMongodbError, IMongodbRecord, IMongodbRepository, MONGODB_CONSTANTS, MongodbRepository } from "@core/mongodb";
import { PermissionsService } from "@domains/permissions";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MAGIC_NUMBERS } from "@shared/constants";
import { IPaginationResponse, IPermission, IRole } from "@shared/interfaces";
import { EntityQuery } from "@shared/types";
import { Model, QueryFilter } from "mongoose";
import { RoleCreateDto, RoleUpdateDto } from "./roles.dto";
import { ROLES_SCHEMA } from "./roles.schema";

@Injectable()
export class RolesService implements IMongodbRepository<IRole> {

  private RoleModel: Model<IRole>;

  constructor(
    private mongodbRepository: MongodbRepository,
    private permissionsService: PermissionsService
  ) { }

  async onModuleInit(): Promise<void> {
    this.RoleModel = this.getModel() as Model<IRole>;
    await this.setModelIndexes();
  }

  async find(entityQuery?: EntityQuery<IRole>): Promise<IRole[] | IPaginationResponse<IRole>> {
    try {
      return await this.mongodbRepository.find<IRole>(this.RoleModel, entityQuery);
    } catch (error) {
      throw formatMongodbError(error, 'RolesService', 'find');
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<IRole | undefined> {
    const record: IMongodbRecord = { property, value };
    try {
      return await this.mongodbRepository.findOne<IRole>(this.RoleModel, record);
    } catch (error) {
      throw formatMongodbError(error, 'RolesService', 'findOne');
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
      throw formatMongodbError(error, 'RolesService', 'save');
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
      throw formatMongodbError(error, 'RolesService', 'updateOne');
    }
  }

  async updateMany(filter: QueryFilter<IRole>, update: Partial<RoleUpdateDto>): Promise<number> {
    try {
      return await this.mongodbRepository.updateMany<IRole>(this.RoleModel, filter, update as Partial<IRole>);
    } catch (error) {
      throw formatMongodbError(error, 'RolesService', 'updateMany');
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
      throw formatMongodbError(error, 'RolesService', 'deleteOne');
    }
  }

  async deleteMany(filter: QueryFilter<IRole>): Promise<number> {
    try {
      return await this.mongodbRepository.deleteMany(this.RoleModel, filter);
    } catch (error) {
      throw formatMongodbError(error, 'RolesService', 'deleteMany');
    }
  }

  getModel(): Model<IRole> | undefined {
    try {
      return this.mongodbRepository.getModel(
        MONGODB_CONSTANTS.ROLES.MODEL,
        ROLES_SCHEMA,
        MONGODB_CONSTANTS.ROLES.COLLECTION
      );
    } catch (error) {
      console.error(`[RolesService] getModel -> Error: ${error}`);
      return undefined;
    }
  }

  async setModelIndexes(): Promise<void> {
    try {
      this.mongodbRepository.setModelIndexes(this.RoleModel);
    } catch (error) {
      console.error(`[RolesService] setModelIndexes -> Error: ${error}`);
    }
  }

  private async resolvePermissions(permissionsIds: string[]): Promise<IPermission[]> {
    const _ids = [...new Set(permissionsIds.map(_id => _id))];
    const permissions = await this.permissionsService.find({ _id: { $in: _ids } } as any) as IPermission[];

    if (permissions.length !== _ids.length) {
      throw new BadRequestException('One or more permissions do not exist');
    }

    return permissions;
  }
}