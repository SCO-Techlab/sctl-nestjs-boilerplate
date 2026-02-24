import { IRole, RolesService } from "@domains/roles";
import { MongodbService } from "@modules/mongodb";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MAGIC_NUMBERS, MONGODB_CONSTANTS } from "@shared/constants";
import { formatMongodbError } from "@shared/helpers";
import { IPaginationResponse } from "@shared/interfaces";
import { BcryptService, PaginationService } from "@shared/services";
import { IEntityQuery } from "@shared/types";
import { Model, QueryFilter } from "mongoose";
import { UserCreateDto, UserPasswordUpdateDto, UserUpdateDto } from "./users.dto";
import { IUser } from "./users.interface";
import { USERS_SCHEMA } from "./users.schema";

@Injectable()
export class UsersService {

  private UserModel: Model<IUser>;

  constructor(
    private mongodbService: MongodbService,
    private paginationService: PaginationService,
    private rolesService: RolesService,
    private bcryptService: BcryptService,
  ) { }

  async onModuleInit(): Promise<void> {
    try {
      this.UserModel = this.mongodbService.getModel<IUser>(
        MONGODB_CONSTANTS.USERS.MODEL,
        USERS_SCHEMA,
        MONGODB_CONSTANTS.USERS.COLLECTION
      ) as Model<IUser>;

      await this.UserModel.createIndexes();
    } catch (error) {
      console.error(`[UsersService] onModuleInit -> Error: ${error}`);
    }
  }

  async find(entityQuery?: IEntityQuery<IUser>): Promise<IUser[] | IPaginationResponse<IUser>> {
    const query: IEntityQuery<IUser> = { ...(entityQuery || {}) };
    const { page, limit } = query;

    try {
      if (page === undefined || limit === undefined) {
        return await this.UserModel.find(query) ?? [];
      }

      delete query.page;
      delete query.limit;

      const totalRecords = await this.UserModel.countDocuments(query).exec();
      const { totalPages, finalPage, skip, sanitizedLimit } =
        this.paginationService.paginationParams(page, limit, totalRecords);

      const data = await this.UserModel
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
      throw formatMongodbError(error, 'UsersService', 'find');
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<IUser | undefined> {
    try {
      const result = await this.UserModel.findOne({ [property]: value });
      return result ?? undefined;
    } catch (error) {
      throw formatMongodbError(error, 'UsersService', 'findOne');
    }
  }

  async save(user: UserCreateDto): Promise<IUser> {
    try {
      const role = await this.resolveRole(user.role);
      const UserModel = new this.UserModel({
        ...user,
        role,
        extension: user.extension ?? {}
      });

      return await UserModel.save();
    } catch (error) {
      throw formatMongodbError(error, 'UsersService', 'save');
    }
  }

  async updateOne(_id: string, user: UserUpdateDto): Promise<IUser> {
    try {
      const set = { ...user } as unknown as Partial<IUser>;
      if (user.role) {
        set.role = await this.resolveRole(user.role);
      }

      const updatedUser = await this.UserModel.findOneAndUpdate(
        { _id },
        { $set: set },
        { returnDocument: 'after', runValidators: true }
      );

      if (!updatedUser) {
        throw this.userNotFound(_id);
      }

      return updatedUser;
    } catch (error) {
      throw formatMongodbError(error, 'UsersService', 'updateOne');
    }
  }

  async updatePassword(_id: string, dto: UserPasswordUpdateDto, validateCurrentPassword: boolean = true): Promise<boolean> {
    try {
      const user = await this.findOne(_id);
      if (!user) {
        throw this.userNotFound(_id);
      }

      if (validateCurrentPassword) {
        const isValid = await this.bcryptService.compare(dto.password ?? '', user.password);
        if (!isValid) {
          throw new BadRequestException('Invalid current password');
        }
      }

      const newPassword = await this.bcryptService.hash(dto.newPassword ?? '');
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
      const result = await this.UserModel.updateMany(
        filter,
        { $set: update },
        { runValidators: true }
      );

      return result?.modifiedCount ?? MAGIC_NUMBERS.N_0;
    } catch (error) {
      throw formatMongodbError(error, 'UsersService', 'updateMany');
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    try {
      const result = await this.UserModel.deleteOne({ _id });

      if (result?.deletedCount !== MAGIC_NUMBERS.N_1) {
        throw this.userNotFound(_id);
      }

      return true;
    } catch (error) {
      throw formatMongodbError(error, 'UsersService', 'deleteOne');
    }
  }

  async deleteMany(filter: QueryFilter<IUser>): Promise<number> {
    try {
      const result = await this.UserModel.deleteMany(filter);
      return result?.deletedCount ?? MAGIC_NUMBERS.N_0;
    } catch (error) {
      throw formatMongodbError(error, 'UsersService', 'deleteMany');
    }
  }

  private async resolveRole(roleId: string): Promise<IRole | undefined> {
    if (!roleId) {
      return undefined;
    }

    const dbRole = await this.rolesService.findOne(roleId, '_id');
    if (!dbRole) {
      throw new BadRequestException(`Role '${roleId}' does not exist`);
    }

    return dbRole;
  }

  private userNotFound(_id: string): NotFoundException {
    return new NotFoundException(`User with id '${_id}' does not exist`);
  }
}