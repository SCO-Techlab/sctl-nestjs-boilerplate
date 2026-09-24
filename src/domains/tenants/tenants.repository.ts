import { LoggerService } from "@core/logger";
import { formatMongodbError, IMongodbRecord, IMongodbRepository, MongodbRepository } from "@core/mongodb";
import { IPaginationResponse } from "@core/pagination";
import { MAGIC_NUMBERS } from "@core/shared/constants";
import { EntityQuery } from "@core/shared/types";
import { UsersRepository } from "@domains/users";
import { Injectable, NotFoundException } from "@nestjs/common";
import { COLLECTIONS } from "@shared/constants";
import { ITenant, IUser } from "@shared/interfaces";
import { Model, QueryFilter } from "mongoose";
import { TenantDto } from "./tenants.dto";
import { TENANTS_SCHEMA } from "./tenants.schema";

@Injectable()
export class TenantsRepository implements IMongodbRepository<ITenant> {

  public get Model(): Model<ITenant> {
    return this._Model;
  }

  private _Model: Model<ITenant>;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly mongodbRepository: MongodbRepository,
    private readonly usersRepository: UsersRepository
  ) { }

  async onModuleInit(): Promise<void> {
    try {
      this._Model = this.mongodbRepository.getModel(COLLECTIONS.TENANTS.MODEL, TENANTS_SCHEMA, COLLECTIONS.TENANTS.COLLECTION);
      await this.mongodbRepository.setModelIndexes(this._Model);
    } catch (error) {
      this.loggerService.error(`[TenantsRepository] onModuleInit -> Error: ${error}`);
    }
  }

  async find(entityQuery?: EntityQuery<ITenant>): Promise<ITenant[] | IPaginationResponse<ITenant>> {
    try {
      return await this.mongodbRepository.find<ITenant>(this.Model, entityQuery);
    } catch (error) {
      throw formatMongodbError(error, 'TenantsRepository', 'find', this.loggerService);
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<ITenant | undefined> {
    const record: IMongodbRecord = { property, value };
    try {
      return await this.mongodbRepository.findOne<ITenant>(this.Model, record);
    } catch (error) {
      throw formatMongodbError(error, 'TenantsRepository', 'findOne', this.loggerService);
    }
  }

  async save(newValue: ITenant | Partial<ITenant>): Promise<ITenant | undefined> {
    try {
      return await this.mongodbRepository.save<ITenant>(this.Model, newValue);
    } catch (error) {
      throw formatMongodbError(error, 'TenantsRepository', 'save', this.loggerService);
    }
  }

  async updateOne(_id: string, updateValue: ITenant | Partial<ITenant>): Promise<ITenant> {
    const record: IMongodbRecord = { property: '_id', value: _id };

    const value: Partial<ITenant> = {
      name: updateValue.name,
      isActive: updateValue.isActive,
      owner: updateValue.owner,
      description: updateValue.description,
      members: updateValue.members,
      avatar: updateValue.avatar
    };

    try {
      const result: ITenant = await this.mongodbRepository.updateOne<ITenant>(this.Model, record, value) as ITenant;
      if (!result) {
        throw new NotFoundException(`Tenant not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'TenantsRepository', 'updateOne', this.loggerService);
    }
  }

  async updateMany(filter: QueryFilter<ITenant>, update: ITenant | Partial<ITenant>): Promise<number> {
    try {
      return await this.mongodbRepository.updateMany<ITenant>(this.Model, filter, update as Partial<ITenant>);
    } catch (error) {
      throw formatMongodbError(error, 'TenantsRepository', 'updateMany', this.loggerService);
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    const record: IMongodbRecord = { property: '_id', value: _id };
    try {
      const result: boolean = await this.mongodbRepository.deleteOne<ITenant>(this.Model, record);
      if (!result) {
        throw new NotFoundException(`Tenant not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'TenantsRepository', 'deleteOne', this.loggerService);
    }
  }

  async deleteMany(filter: QueryFilter<ITenant>): Promise<number> {
    try {
      return await this.mongodbRepository.deleteMany(this.Model, filter);
    } catch (error) {
      throw formatMongodbError(error, 'TenantsRepository', 'deleteMany', this.loggerService);
    }
  }

  async deleteAvatar(_id: string): Promise<boolean> {
    try {
      const result = await this.Model.updateOne({ _id }, { $unset: { avatar: '' } }).exec();
      return (result?.modifiedCount ?? MAGIC_NUMBERS.N_0) > MAGIC_NUMBERS.N_0 || (result?.matchedCount ?? MAGIC_NUMBERS.N_0) > MAGIC_NUMBERS.N_0;
    } catch (error) {
      throw formatMongodbError(error, 'TenantsRepository', 'deleteAvatar', this.loggerService);
    }
  }

  async dtoToEntity(dto: TenantDto): Promise<ITenant | undefined> {
    const keys: string[] = Object.keys(dto ?? {});
    if (!keys?.length) {
      return undefined;
    }

    if (dto?._id) {
      const existRecord = await this.findOne(dto._id, '_id');
      if (existRecord) {
        return existRecord;
      }
    }

    let owner: IUser | undefined = undefined;
    if (dto?.owner) {
      const existOwner = await this.usersRepository.findOne(dto.owner, '_id');
      owner = existOwner as IUser;
    }

    const members: IUser[] = [];
    if (dto?.members?.length) {
      for (const memberId of dto.members) {
        const member = await this.usersRepository.findOne(memberId, '_id');
        if (member) {
          members.push(member);
        }
      }
    }

    const entity: ITenant = {
      _id: dto?._id ?? undefined,
      name: dto?.name ?? undefined,
      isActive: dto?.isActive ?? undefined,
      owner: owner as IUser,
      description: dto?.description ?? undefined,
      members,
      avatar: dto?.avatar ?? undefined,
      createdAt: dto?.createdAt ?? undefined,
      updatedAt: dto?.updatedAt ?? undefined,
      __v: dto?.__v ?? undefined
    };

    return entity;
  }
}