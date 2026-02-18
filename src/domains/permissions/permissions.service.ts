import { MongodbService } from "@modules/mongodb";
import { Injectable, NotFoundException } from "@nestjs/common";
import { MAGIC_NUMBERS, MAGIC_STRINGS, MONGODB_CONSTANTS } from "@shared/constants";
import { formatMongodbError } from "@shared/helpers";
import { IPaginationResponse } from "@shared/interfaces";
import { PaginationService } from "@shared/services";
import { IEntityQuery } from "@shared/types";
import { Model, QueryFilter } from "mongoose";
import { PermissionCreateDto, PermissionUpdateDto } from "./permissions.dto";
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
        const result: IPermission[] = await this.PermissionModel.find(query);
        return result ?? [];
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
        data: data ?? [],
        totalRecords: totalRecords,
        currentPage: finalPage,
        totalPages: totalPages,
        limit: sanitizedLimit,
      };
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'find', true);
    }
  }

  async findOne(value: any, property: string = MAGIC_STRINGS.UNDERSCORE_ID): Promise<IPermission | undefined> {
    try {
      const result = await this.PermissionModel.findOne({ [property]: value });
      return result ?? undefined;
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'findOne', true);
    }
  }

  async save(permission: PermissionCreateDto): Promise<IPermission> {
    const PermissionModel = new this.PermissionModel({
      name: permission.name,
      type: permission.type,
      extension: permission.extension ?? {}
    });

    try {
      return await PermissionModel.save();
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'save', true);
    }
  }

  async updateOne(_id: string, permission: PermissionUpdateDto): Promise<IPermission> {
    try {
      const updatedPermission = await this.PermissionModel.findOneAndUpdate(
        { _id },
        {
          $set: {
            name: permission.name,
            type: permission.type,
            extension: permission.extension ?? {},
          },
        },
        {
          returnDocument: 'after',
          runValidators: true
        }
      );

      if (!updatedPermission) {
        throw this.permissionNotFound(_id);
      }

      return updatedPermission;
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'updateOne', true);
    }
  }

  async updateMany(filter: QueryFilter<IPermission>, update: Partial<PermissionUpdateDto>): Promise<number> {
    try {
      const result = await this.PermissionModel.updateMany(
        filter,
        { $set: update },
        { runValidators: true }
      );

      return result?.modifiedCount ?? MAGIC_NUMBERS.N_0;
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'updateMany', true);
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    try {
      const result = await this.PermissionModel.deleteOne({ _id });
      if (result?.deletedCount !== MAGIC_NUMBERS.N_1) {
        throw this.permissionNotFound(_id);
      }

      return true;
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'deleteOne', true);
    }
  }

  async deleteMany(filter: QueryFilter<IPermission>): Promise<number> {
    try {
      const result = await this.PermissionModel.deleteMany(filter);
      return result?.deletedCount ?? MAGIC_NUMBERS.N_0;
    } catch (error) {
      throw formatMongodbError(error, 'PermissionsService', 'deleteMany', true);
    }
  }

  private permissionNotFound(_id: string): NotFoundException {
    return new NotFoundException(`Permission with id '${_id}' does not exist`);
  }
}
