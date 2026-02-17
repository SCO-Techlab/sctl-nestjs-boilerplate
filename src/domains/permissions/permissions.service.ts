import { MongodbService } from "@modules/mongodb";
import { Injectable } from "@nestjs/common";
import { MAGIC_NUMBERS, MAGIC_STRINGS, MONGODB_CONSTANTS } from "@shared/constants";
import { IPaginationResponse } from "@shared/interfaces";
import { PaginationService } from "@shared/services";
import { IEntityQuery } from "@shared/types";
import { Model } from "mongoose";
import { PermissionDto } from "./permissions.dto";
import { IPermission } from "./permissions.interface";
import { PERMISSIONS_SCHEMA } from "./permissions.schema";

@Injectable()
export class PermissionsService {

  private PermissionModel: Model<IPermission>;

  constructor(
    private mongodbService: MongodbService,
    private paginationService: PaginationService
  ) { }

  async onModuleInit(): Promise<void> {
    try {
      this.PermissionModel = this.mongodbService.getModel<IPermission>(
        MONGODB_CONSTANTS.PERMISSIONS.MODEL,
        PERMISSIONS_SCHEMA,
        MONGODB_CONSTANTS.PERMISSIONS.COLLECTION
      ) as Model<IPermission>;

      await this.PermissionModel.createIndexes();
    } catch (error) {
      console.error(`[PermissionsService] onModuleInit -> Error: ${error}`);
    }
  }

  async find(entityQuery?: IEntityQuery<IPermission>): Promise<IPermission[] | IPaginationResponse<IPermission>> {
    const query: IEntityQuery<IPermission> = { ...(entityQuery || {}) };
    const { page, limit } = query;

    try {
      if (page === undefined || limit === undefined) {
        return await this.PermissionModel.find(query);
      }

      delete query?.page;
      delete query?.limit;

      const totalRecords = await this.PermissionModel.countDocuments(query).exec();
      const { totalPages, finalPage, skip, sanitizedLimit } = this.paginationService.paginationParams(page, limit, totalRecords);

      const data = await this.PermissionModel
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
      console.error(`[PermissionsService] find -> Error: ${error}`);
      return [];
    }
  }

  async findOne(value: any, property: string = MAGIC_STRINGS.UNDERSCORE_ID): Promise<IPermission | undefined> {
    try {
      const result = await this.PermissionModel.findOne({ [property]: value });
      return result ? result : undefined;
    } catch (error) {
      console.error(`[PermissionsService] findOne -> Error: ${error}`);
      return undefined;
    }
  }

  async save(permission: PermissionDto): Promise<IPermission | undefined> {
    const PermissionModel = new this.PermissionModel({
      name: permission.name,
      extension: permission.extension ?? {}
    });

    try {
      const saveResult: IPermission = await PermissionModel.save();
      if (!saveResult) {
        console.error(`[PermissionsService] add -> Unnable to create permission: ${permission.name}`);
        return undefined;
      }

      return saveResult;
    } catch (error) {
      console.error(`[PermissionsService] add -> Error: ${error}`);
      return undefined;
    }
  }

  async updateOne(_id: string, permission: PermissionDto): Promise<IPermission | undefined> {
    try {
      const result = await this.PermissionModel.updateOne({ _id }, {
        $set: {
          name: permission.name,
          extension: permission.extension ? permission.extension : {},
        }
      });

      if (result?.modifiedCount !== MAGIC_NUMBERS.N_1) {
        console.error(`[PermissionsService] updatePermission -> Unnable to update permission: ${permission.name}`);
        return undefined;
      }

      return await this.findOne(_id);
    } catch (error) {
      console.error(`[PermissionsService] updatePermission -> Error: ${error}`);
      return undefined;
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    try {
      const result = await this.PermissionModel.deleteOne({ _id });
      if (result?.deletedCount !== MAGIC_NUMBERS.N_1) {
        console.error(`[PermissionsService] deletePermission -> Unnable to delete permission: ${_id}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`[PermissionsService] deletePermission -> Error: ${error}`);
      return false;
    }
  }

  async modelToDto(permission: IPermission): Promise<PermissionDto> {
    return {
      _id: permission._id,
      name: permission.name,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
      __v: permission.__v
    } as PermissionDto;
  }
}
