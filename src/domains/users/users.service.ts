import { IRole, RolesService } from "@domains/roles";
import { MongodbRepository } from "@modules/mongodb";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MONGODB_CONSTANTS } from "@shared/constants";
import { formatMongodbError } from "@shared/helpers";
import { IMongodbRecord, IMongodbRepository, IPaginationResponse } from "@shared/interfaces";
import { BcryptService } from "@shared/services";
import { IEntityQuery } from "@shared/types";
import { Model, QueryFilter } from "mongoose";
import { UserCreateDto, UserPasswordUpdateDto, UserUpdateDto } from "./users.dto";
import { IUser } from "./users.interface";
import { USERS_SCHEMA } from "./users.schema";

@Injectable()
export class UsersService implements IMongodbRepository<IUser> {

  private UserModel: Model<IUser>;

  constructor(
    private mongodbRepository: MongodbRepository,
    private rolesService: RolesService,
    private bcryptService: BcryptService,
  ) { }

  async onModuleInit(): Promise<void> {
    this.UserModel = this.getModel() as Model<IUser>;
    await this.setModelIndexes();
  }

  async find(entityQuery?: IEntityQuery<IUser>): Promise<IUser[] | IPaginationResponse<IUser>> {
    try {
      return await this.mongodbRepository.find<IUser>(this.UserModel, entityQuery);
    } catch (error) {
      throw formatMongodbError(error, 'UsersService', 'find');
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<IUser | undefined> {
    const record: IMongodbRecord = { property, value };
    try {
      return await this.mongodbRepository.findOne<IUser>(this.UserModel, record);
    } catch (error) {
      throw formatMongodbError(error, 'UsersService', 'findOne');
    }
  }

  async save(user: UserCreateDto): Promise<IUser | undefined> {
    const role = await this.resolveRole(user.role);

    const value: Partial<IUser> = {
      ...user,
      role,
      extension: user.extension ?? {}
    };

    try {
      return await this.mongodbRepository.save<IUser>(this.UserModel, value);
    } catch (error) {
      throw formatMongodbError(error, 'UsersService', 'save');
    }
  }

  async updateOne(_id: string, user: UserUpdateDto): Promise<IUser> {
    const record: IMongodbRecord = { property: '_id', value: _id };

    const value = { ...user } as unknown as Partial<IUser>;
    if (user.role) {
      value.role = await this.resolveRole(user.role);
    }

    try {
      const result: IUser = await this.mongodbRepository.updateOne<IUser>(this.UserModel, record, value) as IUser;
      if (!result) {
        throw new NotFoundException(`User not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'UsersService', 'updateOne');
    }
  }

  async updatePassword(_id: string, dto: UserPasswordUpdateDto, validateCurrentPassword: boolean = true): Promise<boolean> {
    const user = await this.findOne(_id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    if (validateCurrentPassword) {
      const isValid = await this.bcryptService.compare(dto.password ?? '', user.password);
      if (!isValid) {
        throw new BadRequestException('Invalid current password');
      }
    }

    const newPassword = await this.bcryptService.hash(dto.newPassword ?? '');

    try {
      await this.UserModel.updateOne(
        { _id },
        { $set: { password: newPassword } }
      );

      return true;
    } catch (error) {
      throw formatMongodbError(error, 'UsersService', 'updatePassword');
    }
  }

  async updateMany(filter: QueryFilter<IUser>, update: Partial<UserUpdateDto>): Promise<number> {
    try {
      return await this.mongodbRepository.updateMany<IUser>(this.UserModel, filter, update as Partial<IUser>);
    } catch (error) {
      throw formatMongodbError(error, 'UsersService', 'updateMany');
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    const record: IMongodbRecord = { property: '_id', value: _id };
    try {
      const result: boolean = await this.mongodbRepository.deleteOne<IUser>(this.UserModel, record);
      if (!result) {
        throw new NotFoundException(`User not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'UsersService', 'deleteOne');
    }
  }

  async deleteMany(filter: QueryFilter<IUser>): Promise<number> {
    try {
      return await this.mongodbRepository.deleteMany(this.UserModel, filter);
    } catch (error) {
      throw formatMongodbError(error, 'UsersService', 'deleteMany');
    }
  }

  getModel(): Model<IUser> | undefined {
    try {
      return this.mongodbRepository.getModel(
        MONGODB_CONSTANTS.USERS.MODEL,
        USERS_SCHEMA,
        MONGODB_CONSTANTS.USERS.COLLECTION
      );
    } catch (error) {
      console.error(`[UsersService] getModel -> Error: ${error}`);
      return undefined;
    }
  }

  async setModelIndexes(): Promise<void> {
    try {
      this.mongodbRepository.setModelIndexes(this.UserModel);
    } catch (error) {
      console.error(`[UsersService] setModelIndexes -> Error: ${error}`);
    }
  }

  private async resolveRole(roleId: string): Promise<IRole | undefined> {
    if (!roleId) {
      return undefined;
    }

    const dbRole = await this.rolesService.findOne(roleId, '_id');
    if (!dbRole) {
      throw new NotFoundException(`Role not found`);
    }

    return dbRole;
  }
}