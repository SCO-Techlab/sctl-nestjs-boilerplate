import { IUser } from "@domains/users";
import { IJwtConfig } from "@modules/jwt";
import { MongodbRepository } from "@modules/mongodb";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MONGODB_CONSTANTS } from "@shared/constants";
import { formatMongodbError, parseDateUnits } from "@shared/helpers";
import { IMongodbRecord, IMongodbRepository, IPaginationResponse } from "@shared/interfaces";
import { IEntityQuery } from "@shared/types";
import { Model, QueryFilter } from "mongoose";
import { IToken } from "./tokens.interface";
import { TOKENS_SCHEMA } from "./tokens.schema";

@Injectable()
export class TokensService implements IMongodbRepository<IToken> {

  private TokenModel: Model<IToken>;

  constructor(
    private mongodbRepository: MongodbRepository,
    private configService: ConfigService
  ) { }

  async onModuleInit(): Promise<void> {
    this.TokenModel = this.getModel() as Model<IToken>;
    await this.setModelIndexes();
  }

  async find(entityQuery?: IEntityQuery<IToken>): Promise<IToken[] | IPaginationResponse<IToken>> {
    try {
      return await this.mongodbRepository.find<IToken>(this.TokenModel, entityQuery);
    } catch (error) {
      throw formatMongodbError(error, 'TokenService', 'find');
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<IToken | undefined> {
    const record: IMongodbRecord = { property, value };
    try {
      return await this.mongodbRepository.findOne<IToken>(this.TokenModel, record);
    } catch (error) {
      throw formatMongodbError(error, 'TokenService', 'findOne');
    }
  }

  async save(token: IToken): Promise<IToken | undefined> {
    const value: Partial<IToken> = {
      user: token.user,
      jti: token.jti,
      accessExpiresAt: token.accessExpiresAt,
      refreshExpiresAt: token.refreshExpiresAt,
      isRevoked: token.isRevoked ?? false,
      revokedAt: token.revokedAt ?? undefined,
    };

    try {
      return await this.mongodbRepository.save<IToken>(this.TokenModel, value);
    } catch (error) {
      throw formatMongodbError(error, 'TokenService', 'save');
    }
  }

  async updateOne(_id: string, token: IToken): Promise<IToken> {
    const record: IMongodbRecord = { property: '_id', value: _id };

    const value: Partial<IToken> = {
      user: token.user,
      jti: token.jti,
      accessExpiresAt: token.accessExpiresAt,
      refreshExpiresAt: token.refreshExpiresAt,
      isRevoked: token.isRevoked,
      revokedAt: token.revokedAt,
    };

    try {
      const result: IToken = await this.mongodbRepository.updateOne<IToken>(this.TokenModel, record, value) as IToken;
      if (!result) {
        throw new NotFoundException(`Token not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'TokenService', 'updateOne');
    }
  }

  async updateMany(filter: QueryFilter<IToken>, update: Partial<IToken>): Promise<number> {
    try {
      return await this.mongodbRepository.updateMany<IToken>(this.TokenModel, filter, update as Partial<IToken>);
    } catch (error) {
      throw formatMongodbError(error, 'TokenService', 'updateMany');
    }
  }
  
  async deleteOne(_id: string): Promise<boolean> {
    const record: IMongodbRecord = { property: '_id', value: _id };
    try {
      const result: boolean = await this.mongodbRepository.deleteOne<IToken>(this.TokenModel, record);
      if (!result) {
        throw new NotFoundException(`Token not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'TokenService', 'deleteOne');
    }
  }

  async deleteMany(filter: QueryFilter<IToken>): Promise<number> {
    try {
      return await this.mongodbRepository.deleteMany(this.TokenModel, filter);
    } catch (error) {
      throw formatMongodbError(error, 'TokenService', 'deleteMany');
    }
  }

  async findLatestActiveByUser(userId: string): Promise<IToken | undefined> {
    try {
      return await this.TokenModel
        .findOne({ user: userId, isRevoked: false })
        .sort({ createdAt: -1 })
        .exec() ?? undefined;
    } catch (error) {
      throw formatMongodbError(error, 'TokenService', 'findLatestActiveByUser');
    }
  }

  async updateUserSession(user: IUser, jti: string) {
    const jwtConfig: IJwtConfig = this.configService.get('jwt') as IJwtConfig;

    await this.updateMany(
      { user: user._id, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() }
    );

    await this.save({
      user,
      jti,
      accessExpiresAt: new Date(Date.now() + parseDateUnits(jwtConfig?.signOptions?.expiresIn)),
      refreshExpiresAt: jwtConfig?.refresh?.expiresIn
        ? new Date(Date.now() + parseDateUnits(jwtConfig.refresh.expiresIn))
        : undefined,
      isRevoked: false,
      revokedAt: undefined
    });
  }

  getModel(): Model<IToken> | undefined {
    try {
      return this.mongodbRepository.getModel(
        MONGODB_CONSTANTS.TOKENS.MODEL,
        TOKENS_SCHEMA,
        MONGODB_CONSTANTS.TOKENS.COLLECTION
      );
    } catch (error) {
      console.error(`[TokenService] getModel -> Error: ${error}`);
      return undefined;
    }
  }

  async setModelIndexes(): Promise<void> {
    try {
      this.mongodbRepository.setModelIndexes(this.TokenModel);
    } catch (error) {
      console.error(`[TokenService] setModelIndexes -> Error: ${error}`);
    }
  }
}
