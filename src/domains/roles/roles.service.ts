import { IPermission, PermissionDto, PermissionsService } from "@domains/permissions";
import { MongodbService } from "@modules/mongodb";
import { BadRequestException, Injectable } from "@nestjs/common";
import { MAGIC_NUMBERS, MAGIC_STRINGS, MONGODB_CONSTANTS } from "@shared/constants";
import { IPaginationResponse } from "@shared/interfaces";
import { PaginationService } from "@shared/services";
import { IEntityQuery } from "@shared/types";
import { Model } from "mongoose";
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
        return await this.RoleModel.find(query);
      }

      delete query.page;
      delete query.limit;

      const totalRecords = await this.RoleModel.countDocuments(query).exec();
      const { totalPages, finalPage, skip, sanitizedLimit } = this.paginationService.paginationParams(page, limit, totalRecords);

      const data = await this.RoleModel
        .find(query)
        .skip(skip)
        .limit(sanitizedLimit);

      return {
        data: data,
        totalRecords: totalRecords,
        currentPage: finalPage,
        totalPages: totalPages,
        limit: sanitizedLimit,
      };
    } catch (error) {
      console.error(`[RolesService] find -> Error: ${error}`);
      return [];
    }
  }

  async findOne(value: any, property: string = MAGIC_STRINGS.UNDERSCORE_ID): Promise<IRole | undefined> {
    try {
      const result = await this.RoleModel.findOne({ [property]: value });
      return result ? result : undefined;
    } catch (error) {
      console.error(`[RolesService] findOne -> Error: ${error}`);
      return undefined;
    }
  }

  async save(role: RoleDto): Promise<IRole | undefined> {
    let permissions: IPermission[] = [];
    if (role?.permissions && role?.permissions?.length > MAGIC_NUMBERS.N_0) {
      const names = [...new Set(role.permissions.map(p => p.name))];
      permissions = await this.permissionsService.find({ name: { $in: names } } as any) as IPermission[];
      if (permissions.length !== names.length) {
        throw new BadRequestException('One or more permissions do not exist');
      }
    }

    const RoleModel = new this.RoleModel({
      name: role.name,
      permissions: permissions,
      extension: role.extension ? role.extension : {},
    });

    try {
      const saveResult: IRole = await RoleModel.save();
      if (!saveResult) {
        console.log(`[RolesService] add -> Unnable to create role: ${role.name}`);
        return undefined;
      }

      return saveResult;
    } catch (error) {
      console.log(`[RolesService] add -> Error: ${error}`);
      return undefined;
    }
  }

  async updateOne(_id: string, role: RoleDto): Promise<IRole | undefined> {
    let permissions: IPermission[] = [];
    if (role?.permissions && role?.permissions?.length > MAGIC_NUMBERS.N_0) {
      const names = [...new Set(role.permissions.map(p => p.name))];
      permissions = await this.permissionsService.find({ name: { $in: names } } as any) as IPermission[];
      if (permissions.length !== names.length) {
        throw new BadRequestException('One or more permissions do not exist');
      }
    }

    try {
      const result = await this.RoleModel.updateOne({ _id }, {
        $set: {
          name: role.name,
          permissions: permissions,
          extension: role.extension ? role.extension : {},
        }
      });

      if (result?.modifiedCount !== MAGIC_NUMBERS.N_1) {
        console.log(`[RolesService] updateRole -> Unnable to update role: ${role.name}`);
        return undefined;
      }

      return await this.findOne(_id);
    } catch (error) {
      console.log(`[RolesService] updateRole -> Error: ${error}`);
      return undefined;
    }
  }

  async deleteRole(_id: string): Promise<boolean> {
    try {
      const result = await this.RoleModel.deleteOne({ _id });

      if (result?.deletedCount !== MAGIC_NUMBERS.N_1) {
        console.log(`[RolesService] deleteRole -> Unnable to delete role: ${_id}`);
        return false;
      }

      return true;
    } catch (error) {
      console.log(`[RolesService] deleteRole -> Error: ${error}`);
      return false;
    }
  }

  async modelToDto(role: IRole): Promise<RoleDto> {
    let permissionsDtos: PermissionDto[] = [];
    if (role?.permissions && role?.permissions?.length > MAGIC_NUMBERS.N_0) {
      permissionsDtos = await Promise.all(role.permissions.map(async p => await this.permissionsService.modelToDto(p)));
    }

    return {
      _id: role._id,
      name: role.name,
      permissions: permissionsDtos,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
