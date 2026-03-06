import { MongodbService } from "@modules/mongodb";
import { Injectable, NotFoundException } from "@nestjs/common";
import { MAGIC_NUMBERS, MONGODB_CONSTANTS } from "@shared/constants";
import { formatMongodbError } from "@shared/helpers";
import { IPaginationResponse } from "@shared/interfaces";
import { PaginationService } from "@shared/services";
import { IEntityQuery } from "@shared/types";
import { Model, QueryFilter } from "mongoose";
import { IRefreshToken } from "./refresh-token.interface";
import { REFRESH_TOKENS_SCHEMA } from "./refresh-token.schema";

@Injectable()
export class RefreshTokenService {

  private RefreshTokenModel: Model<IRefreshToken>;

  constructor(
    private mongodbService: MongodbService,
    private paginationService: PaginationService
  ) { }

  async onModuleInit(): Promise<void> {
    try {
      this.RefreshTokenModel = this.mongodbService.getModel<IRefreshToken>(
        MONGODB_CONSTANTS.REFRESH_TOKENS.MODEL,
        REFRESH_TOKENS_SCHEMA,
        MONGODB_CONSTANTS.REFRESH_TOKENS.COLLECTION
      ) as Model<IRefreshToken>;

      await this.RefreshTokenModel.createIndexes();
    } catch (error) {
      console.error(`[RefreshTokenService] onModuleInit -> Error: ${error}`);
    }
  }

  async find(entityQuery?: IEntityQuery<IRefreshToken>): Promise<IRefreshToken[] | IPaginationResponse<IRefreshToken>> {
    const query: IEntityQuery<IRefreshToken> = { ...(entityQuery || {}) };
    const { page, limit } = query;

    try {
      if (page === undefined || limit === undefined) {
        const result: IRefreshToken[] = await this.RefreshTokenModel.find(query);
        return result ?? [];
      }

      delete query?.page;
      delete query?.limit;

      const totalRecords = await this.RefreshTokenModel.countDocuments(query).exec();
      const { totalPages, finalPage, skip, sanitizedLimit } = this.paginationService.paginationParams(page, limit, totalRecords);

      const data = await this.RefreshTokenModel
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
      throw formatMongodbError(error, 'RefreshTokenService', 'find');
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<IRefreshToken | undefined> {
    try {
      const result = await this.RefreshTokenModel.findOne({ [property]: value });
      return result ?? undefined;
    } catch (error) {
      throw formatMongodbError(error, 'RefreshTokenService', 'findOne');
    }
  }

  async save(refreshToken: IRefreshToken): Promise<IRefreshToken> {
    const RefreshTokenModel = new this.RefreshTokenModel({
      user: refreshToken.user,
      tokenHash: refreshToken.tokenHash,
      expiresAt: refreshToken.expiresAt ?? new Date(),
      isRevoked: refreshToken.isRevoked ?? false,
      revokedAt: refreshToken.revokedAt ?? null,
    });

    try {
      return await RefreshTokenModel.save();
    } catch (error) {
      throw formatMongodbError(error, 'RefreshTokenService', 'save');
    }
  }

  async updateOne(_id: string, refreshToken: IRefreshToken): Promise<IRefreshToken> {
    try {
      const updatedRefreshToken = await this.RefreshTokenModel.findOneAndUpdate(
        { _id },
        {
          $set: {
            user: refreshToken.user,
            tokenHash: refreshToken.tokenHash,
            expiresAt: refreshToken.expiresAt,
            isRevoked: refreshToken.isRevoked,
            revokedAt: refreshToken.revokedAt,
          },
        },
        {
          returnDocument: 'after',
          runValidators: true
        }
      );

      if (!updatedRefreshToken) {
        throw new NotFoundException(`RefreshToken not found`);
      }

      return updatedRefreshToken;
    } catch (error) {
      throw formatMongodbError(error, 'RefreshTokenService', 'updateOne');
    }
  }

  async updateMany(filter: QueryFilter<IRefreshToken>, update: Partial<IRefreshToken>): Promise<number> {
    try {
      const result = await this.RefreshTokenModel.updateMany(
        filter,
        { $set: update },
        { runValidators: true }
      );

      return result?.modifiedCount ?? MAGIC_NUMBERS.N_0;
    } catch (error) {
      throw formatMongodbError(error, 'RefreshTokenService', 'updateMany');
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    try {
      const result = await this.RefreshTokenModel.deleteOne({ _id });
      if (result?.deletedCount !== MAGIC_NUMBERS.N_1) {
        throw new NotFoundException(`RefreshToken not found`);
      }

      return true;
    } catch (error) {
      throw formatMongodbError(error, 'RefreshTokenService', 'deleteOne');
    }
  }

  async deleteMany(filter: QueryFilter<IRefreshToken>): Promise<number> {
    try {
      const result = await this.RefreshTokenModel.deleteMany(filter);
      return result?.deletedCount ?? MAGIC_NUMBERS.N_0;
    } catch (error) {
      throw formatMongodbError(error, 'RefreshTokenService', 'deleteMany');
    }
  }
}
