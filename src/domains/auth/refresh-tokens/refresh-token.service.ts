import { MongodbRepository } from "@modules/mongodb";
import { Injectable, NotFoundException } from "@nestjs/common";
import { MONGODB_CONSTANTS } from "@shared/constants";
import { formatMongodbError } from "@shared/helpers";
import { IMongodbRecord, IMongodbRepository, IPaginationResponse } from "@shared/interfaces";
import { IEntityQuery } from "@shared/types";
import { Model, QueryFilter } from "mongoose";
import { IRefreshToken } from "./refresh-token.interface";
import { REFRESH_TOKENS_SCHEMA } from "./refresh-token.schema";

@Injectable()
export class RefreshTokenService implements IMongodbRepository<IRefreshToken> {

  private RefreshTokenModel: Model<IRefreshToken>;

  constructor(
    private mongodbRepository: MongodbRepository
  ) { }

  async onModuleInit(): Promise<void> {
    this.RefreshTokenModel = this.getModel() as Model<IRefreshToken>;
    await this.setModelIndexes();
  }

  async find(entityQuery?: IEntityQuery<IRefreshToken>): Promise<IRefreshToken[] | IPaginationResponse<IRefreshToken>> {
    try {
      return await this.mongodbRepository.find<IRefreshToken>(this.RefreshTokenModel, entityQuery);
    } catch (error) {
      throw formatMongodbError(error, 'RefreshTokenService', 'find');
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<IRefreshToken | undefined> {
    const record: IMongodbRecord = { property, value };
    try {
      return await this.mongodbRepository.findOne<IRefreshToken>(this.RefreshTokenModel, record);
    } catch (error) {
      throw formatMongodbError(error, 'RefreshTokenService', 'findOne');
    }
  }

  async save(refreshToken: IRefreshToken): Promise<IRefreshToken | undefined> {
    const value: Partial<IRefreshToken> = {
      user: refreshToken.user,
      tokenHash: refreshToken.tokenHash,
      expiresAt: refreshToken.expiresAt ?? new Date(),
      isRevoked: refreshToken.isRevoked ?? false,
      revokedAt: refreshToken.revokedAt ?? undefined,
    };

    try {
      return await this.mongodbRepository.save<IRefreshToken>(this.RefreshTokenModel, value);
    } catch (error) {
      throw formatMongodbError(error, 'RefreshTokenService', 'save');
    }
  }

  async updateOne(_id: string, refreshToken: IRefreshToken): Promise<IRefreshToken> {
    const record: IMongodbRecord = { property: '_id', value: _id };

    const value: Partial<IRefreshToken> = {
      user: refreshToken.user,
      tokenHash: refreshToken.tokenHash,
      expiresAt: refreshToken.expiresAt,
      isRevoked: refreshToken.isRevoked,
      revokedAt: refreshToken.revokedAt,
    };

    try {
      const result: IRefreshToken = await this.mongodbRepository.updateOne<IRefreshToken>(this.RefreshTokenModel, record, value) as IRefreshToken;
      if (!result) {
        throw new NotFoundException(`Refresh token not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'RefreshTokenService', 'updateOne');
    }
  }

  async updateMany(filter: QueryFilter<IRefreshToken>, update: Partial<IRefreshToken>): Promise<number> {
    try {
      return await this.mongodbRepository.updateMany<IRefreshToken>(this.RefreshTokenModel, filter, update as Partial<IRefreshToken>);
    } catch (error) {
      throw formatMongodbError(error, 'RefreshTokenService', 'updateMany');
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    const record: IMongodbRecord = { property: '_id', value: _id };
    try {
      const result: boolean = await this.mongodbRepository.deleteOne<IRefreshToken>(this.RefreshTokenModel, record);
      if (!result) {
        throw new NotFoundException(`Refresh token not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'RefreshTokenService', 'deleteOne');
    }
  }

  async deleteMany(filter: QueryFilter<IRefreshToken>): Promise<number> {
    try {
      return await this.mongodbRepository.deleteMany(this.RefreshTokenModel, filter);
    } catch (error) {
      throw formatMongodbError(error, 'RefreshTokenService', 'deleteMany');
    }
  }

  getModel(): Model<IRefreshToken> | undefined {
    try {
      return this.mongodbRepository.getModel(
        MONGODB_CONSTANTS.REFRESH_TOKENS.MODEL,
        REFRESH_TOKENS_SCHEMA,
        MONGODB_CONSTANTS.REFRESH_TOKENS.COLLECTION
      );
    } catch (error) {
      console.error(`[RefreshTokenService] getModel -> Error: ${error}`);
      return undefined;
    }
  }

  async setModelIndexes(): Promise<void> {
    try {
      this.mongodbRepository.setModelIndexes(this.RefreshTokenModel);
    } catch (error) {
      console.error(`[RefreshTokenService] setModelIndexes -> Error: ${error}`);
    }
  }
}
