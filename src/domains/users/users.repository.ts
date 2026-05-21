import { LoggerService } from "@core/logger";
import { MongodbRepository, formatMongodbError } from "@core/mongodb";
import { IMongodbRecord, IMongodbRepository, IPaginationResponse } from "@core/shared/interfaces";
import { EntityQuery } from "@core/shared/types";
import { RolesRepository } from "@domains/roles";
import { Injectable, NotFoundException } from "@nestjs/common";
import { COLLECTIONS } from "@shared/constants";
import { IRole, IUser } from "@shared/interfaces";
import { Model, QueryFilter } from "mongoose";
import { UserDto } from "./users.dto";
import { USERS_SCHEMA } from "./users.schema";

@Injectable()
export class UsersRepository implements IMongodbRepository<IUser> {

  public get Model(): Model<IUser> {
    return this._Model;
  }

  private _Model: Model<IUser>;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly mongodbRepository: MongodbRepository,
    private readonly rolesRepository: RolesRepository
  ) { }

  async onModuleInit(): Promise<void> {
    try {
      this._Model = this.mongodbRepository.getModel(COLLECTIONS.USERS.MODEL, USERS_SCHEMA, COLLECTIONS.USERS.COLLECTION);
      await this.mongodbRepository.setModelIndexes(this._Model);
    } catch (error) {
      this.loggerService.error(`[UsersRepository] onModuleInit -> Error: ${error}`);
    }
  }

  async find(entityQuery?: EntityQuery<IUser>): Promise<IUser[] | IPaginationResponse<IUser>> {
    try {
      return await this.mongodbRepository.find<IUser>(this._Model, entityQuery);
    } catch (error) {
      throw formatMongodbError(error, 'UsersRepository', 'find', this.loggerService);
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<IUser | undefined> {
    const record: IMongodbRecord = { property, value };
    try {
      return await this.mongodbRepository.findOne<IUser>(this._Model, record);
    } catch (error) {
      throw formatMongodbError(error, 'UsersRepository', 'findOne', this.loggerService);
    }
  }

  async save(newValue: IUser | Partial<IUser>): Promise<IUser | undefined> {
    try {
      return await this.mongodbRepository.save<IUser>(this._Model, newValue);
    } catch (error) {
      throw formatMongodbError(error, 'UsersRepository', 'save', this.loggerService);
    }
  }

  async updateOne(_id: string, updateValue: IUser | Partial<IUser>): Promise<IUser> {
    const record: IMongodbRecord = { property: '_id', value: _id };

    const value = {
      email: updateValue.email,
      userName: updateValue.userName,
      personalName: updateValue.personalName,
      active: updateValue.active,
      emailConfirmed: updateValue.emailConfirmed,
      emailConfirmedAt: updateValue.emailConfirmed ? updateValue.emailConfirmedAt : null,
      pwdRecoveryToken: updateValue.pwdRecoveryToken,
      pwdRecoveryDate: updateValue.pwdRecoveryDate,
      avatar: updateValue.avatar,
      role: updateValue.role
    } as Partial<IUser>;

    try {
      const result: IUser = await this.mongodbRepository.updateOne<IUser>(this._Model, record, value) as IUser;
      if (!result) {
        throw new NotFoundException(`User not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'UsersRepository', 'updateOne', this.loggerService);
    }
  }

  async updateMany(filter: QueryFilter<IUser>, update: IUser | Partial<IUser>): Promise<number> {
    try {
      return await this.mongodbRepository.updateMany<IUser>(this._Model, filter, update as Partial<IUser>);
    } catch (error) {
      throw formatMongodbError(error, 'UsersRepository', 'updateMany', this.loggerService);
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    const record: IMongodbRecord = { property: '_id', value: _id };
    try {
      const result: boolean = await this.mongodbRepository.deleteOne<IUser>(this._Model, record);
      if (!result) {
        throw new NotFoundException(`User not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'UsersRepository', 'deleteOne', this.loggerService);
    }
  }

  async deleteMany(filter: QueryFilter<IUser>): Promise<number> {
    try {
      return await this.mongodbRepository.deleteMany(this._Model, filter);
    } catch (error) {
      throw formatMongodbError(error, 'UsersRepository', 'deleteMany', this.loggerService);
    }
  }

  async dtoToEntity(dto: UserDto): Promise<IUser | undefined> {
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

    let role: IRole | undefined = undefined;
    if (dto.role) {
      role = await this.rolesRepository.findOne(dto.role, '_id') as IRole;
      if (!role) {
        throw new NotFoundException(`Role not found`);
      }
    }

    const entity: IUser = {
      _id: dto?._id ?? undefined,
      email: dto?.email ?? undefined,
      password: dto?.password ?? undefined,
      userName: dto?.userName ?? undefined,
      personalName: dto?.personalName ?? undefined,
      active: dto?.active ?? undefined,
      emailConfirmed: dto?.emailConfirmed ?? undefined,
      emailConfirmedAt: dto?.emailConfirmedAt ?? undefined,
      role: role as IRole,
      pwdRecoveryToken: dto?.pwdRecoveryToken ?? undefined,
      pwdRecoveryDate: dto?.pwdRecoveryDate ?? undefined,
      avatar: dto?.avatar ?? undefined,
      createdAt: dto?.createdAt ?? undefined,
      updatedAt: dto?.updatedAt ?? undefined,
      __v: dto?.__v ?? undefined
    };

    return entity;
  }
}