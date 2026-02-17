import { IPermission, PermissionsService } from "@domains/permissions";
import { MongodbService } from "@modules/mongodb";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MAGIC_NUMBERS, MAGIC_STRINGS, MONGODB_CONSTANTS } from "@shared/constants";
import { formatMongodbError } from "@shared/helpers";
import { IPaginationResponse } from "@shared/interfaces";
import { PaginationService } from "@shared/services";
import { IEntityQuery } from "@shared/types";
import { Model, QueryFilter } from "mongoose";
import { RoleDto } from "./roles.dto";
import { IRole } from "./roles.interface";
import { ROLES_SCHEMA } from "./roles.schema";

@Injectable()
export class RolesService {

  private RoleModel: Model<IRole>;

  constructor(
    private mongodbService: MongodbService,
    private paginationService: PaginationService,
    private permissionsService: PermissionsService
  ) { }

  async onModuleInit(): Promise<void> {
    try {
      this.RoleModel = this.mongodbService.getModel<IRole>(
        MONGODB_CONSTANTS.ROLES.MODEL,
        ROLES_SCHEMA,
        MONGODB_CONSTANTS.ROLES.COLLECTION
      ) as Model<IRole>;

      await this.RoleModel.createIndexes();
    } catch (error) {
      console.error(`[RolesService] onModuleInit -> Error: ${error}`);
    }
  }

  async find(entityQuery?: IEntityQuery<IRole>): Promise<IRole[] | IPaginationResponse<IRole>> {
    const query: IEntityQuery<IRole> = { ...(entityQuery || {}) };
    const { page, limit } = query;

    try {
      if (page === undefined || limit === undefined) {
        const result: IRole[] = await this.RoleModel.find(query);
        return result ?? [];
      }

      delete query?.page;
      delete query?.limit;

      const totalRecords = await this.RoleModel.countDocuments(query).exec();
      const { totalPages, finalPage, skip, sanitizedLimit } = this.paginationService.paginationParams(page, limit, totalRecords);

      const data = await this.RoleModel
        .find(query)
        .skip(skip)
        .limit(sanitizedLimit);

      return {
        data: data ?? [],
        totalRecords,
        currentPage: finalPage,
        totalPages,
        limit: sanitizedLimit,
      };
    } catch (error) {
      throw formatMongodbError(error, 'RolesService', 'find', true);
    }
  }

  async findOne(value: any, property: string = MAGIC_STRINGS.UNDERSCORE_ID): Promise<IRole | undefined> {
    try {
      const result = await this.RoleModel.findOne({ [property]: value });
      return result ?? undefined;
    } catch (error) {
      throw formatMongodbError(error, 'RolesService', 'findOne', true);
    }
  }

  async save(role: RoleDto): Promise<IRole> {
    const permissions: IPermission[] = await this.resolvePermissions(role);

    const RoleModel = new this.RoleModel({
      name: role.name,
      permissions,
      extension: role.extension ?? {},
    });

    try {
      return await RoleModel.save();
    } catch (error) {
      throw formatMongodbError(error, 'RolesService', 'save', true);
    }
  }

  async updateOne(_id: string, role: RoleDto): Promise<IRole> {
    const permissions: IPermission[] = await this.resolvePermissions(role);

    try {
      const updatedRole = await this.RoleModel.findOneAndUpdate(
        { _id },
        { $set: { name: role.name, permissions, extension: role.extension ?? {} } },
        { runValidators: true, returnDocument: 'after' }
      );

      if (!updatedRole) {
        throw this.roleNotFound(_id);
      }

      return updatedRole;
    } catch (error) {
      throw formatMongodbError(error, 'RolesService', 'updateOne', true);
    }
  }

  async updateMany(filter: QueryFilter<IRole>, update: Partial<RoleDto>): Promise<number> {
    try {
      const result = await this.RoleModel.updateMany(
        filter,
        { $set: update },
        { runValidators: true }
      );

      return result?.modifiedCount ?? MAGIC_NUMBERS.N_0;
    } catch (error) {
      throw formatMongodbError(error, 'RolesService', 'updateMany', true);
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    try {
      const result = await this.RoleModel.deleteOne({ _id });
      if (result?.deletedCount !== MAGIC_NUMBERS.N_1) {
        throw this.roleNotFound(_id);
      }

      return true;
    } catch (error) {
      throw formatMongodbError(error, 'RolesService', 'deleteOne', true);
    }
  }

  async deleteMany(filter: QueryFilter<IRole>): Promise<number> {
    try {
      const result = await this.RoleModel.deleteMany(filter);
      return result?.deletedCount ?? MAGIC_NUMBERS.N_0;
    } catch (error) {
      throw formatMongodbError(error, 'RolesService', 'deleteMany', true);
    }
  }
  
  private async resolvePermissions(role: RoleDto): Promise<IPermission[]> {
    if (!role?.permissions || role.permissions.length === MAGIC_NUMBERS.N_0) {
      return [];
    }

    const _ids = [...new Set(role.permissions.map(_id => _id))];
    const permissions = await this.permissionsService.find({ _id: { $in: _ids } } as any) as IPermission[];

    if (permissions.length !== _ids.length) {
      throw new BadRequestException('One or more permissions do not exist');
    }

    return permissions;
  }

  private roleNotFound(_id: string): NotFoundException {
    return new NotFoundException(`Role with id '${_id}' does not exist`);
  }
}