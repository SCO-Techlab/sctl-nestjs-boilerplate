import { EmailerService } from "@core/emailer";
import { GRIDFS_BUCKETS, GridfsService, IGridfsFile, IGridfsGetFileOptions } from "@core/gridfs";
import { formatMongodbError, IMongodbRecord, IMongodbRepository, MONGODB_CONSTANTS, MongodbRepository } from "@core/mongodb";
import { IRole, RolesService } from "@domains/roles";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MAGIC_NUMBERS, TEMPLATES, TRANSLATES } from "@shared/constants";
import { getFrontendUrl } from "@shared/helpers";
import { IPaginationResponse, IUser } from "@shared/interfaces";
import { BcryptService } from "@shared/services";
import { EntityQuery } from "@shared/types";
import { Model, QueryFilter } from "mongoose";
import { UserCreateDto, UserPasswordUpdateDto, UserUpdateDto } from "./users.dto";
import { USERS_SCHEMA } from "./users.schema";

@Injectable()
export class UsersService implements IMongodbRepository<IUser> {

  private UserModel: Model<IUser>;

  constructor(
    private mongodbRepository: MongodbRepository,
    private gridfsService: GridfsService,
    private rolesService: RolesService,
    private bcryptService: BcryptService,
    private emailerService: EmailerService,
    private configService: ConfigService
  ) { }

  async onModuleInit(): Promise<void> {
    this.UserModel = this.getModel() as Model<IUser>;
    await this.setModelIndexes();
  }

  async find(entityQuery?: EntityQuery<IUser>): Promise<IUser[] | IPaginationResponse<IUser>> {
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
      role
    };

    try {
      return await this.mongodbRepository.save<IUser>(this.UserModel, value);
    } catch (error) {
      throw formatMongodbError(error, 'UsersService', 'save');
    }
  }

  async updateOne(_id: string, user: UserUpdateDto): Promise<IUser> {
    const record: IMongodbRecord = { property: '_id', value: _id };

    const value = {
      email: user.email,
      userName: user.userName,
      personalName: user.personalName,
      active: user.active,
      emailConfirmed: user.emailConfirmed,
      emailConfirmedAt: user.emailConfirmed ? user.emailConfirmedAt : null,
      pwdRecoveryToken: user.pwdRecoveryToken,
      pwdRecoveryDate: user.pwdRecoveryDate,
      avatar: user.avatar
    } as Partial<IUser>;
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

  async sendWelcomeEmail(_id: string, lang: string): Promise<boolean> {
    const existUser: IUser = await this.findOne(_id) as IUser;
    if (!existUser) {
      throw new NotFoundException(`User not found`);
    }

    return await this.emailerService.sendTemplate({
      template: TEMPLATES.WELCOME,
      context: {
        welcome: {
          params: {
            name: existUser.userName ?? existUser.personalName ?? existUser.email ?? '',
            link: getFrontendUrl(
              this.configService.get('app').httpsEnabled,
              this.configService.get('app').host,
              this.configService.get('app').production ? this.configService.get('app').port : MAGIC_NUMBERS.N_4200,
              `auth/confirm-email/${existUser.email}`
            )
          },
          literals: {
            welcomeText: TRANSLATES[lang].welcome.welcomeText,
            message: TRANSLATES[lang].welcome.message,
            linkText: TRANSLATES[lang].welcome.linkText
          }
        },
        footer: {
          params: {
            year: new Date().getFullYear(),
            appName: this.configService.get('app').appName
          }
        }
      },
      receivers: [existUser.email],
      subject: TRANSLATES[lang].welcome.subject
    });
  }

  async deleteUserAvatar(_id: string): Promise<boolean> {
    const existUser: IUser = await this.findOne(_id) as IUser;
    if (!existUser) {
      throw new NotFoundException(`User not found`);
    }

    try {
      const getPptions: IGridfsGetFileOptions = { filter: { 'metadata.email': existUser?.email } };
      const currentAvatar: IGridfsFile = (await this.gridfsService.getFiles(GRIDFS_BUCKETS.AVATARS, getPptions))[MAGIC_NUMBERS.N_0];
      if (currentAvatar) {
        await this.gridfsService.deleteFiles(GRIDFS_BUCKETS.AVATARS, [currentAvatar._id as string]);
      }

      await this.UserModel.updateOne({ _id }, { $unset: { avatar: '' } }).exec();
      return true;
    } catch {
      return false;
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