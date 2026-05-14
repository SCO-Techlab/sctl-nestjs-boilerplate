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
import { ISession } from "./sessions.interface";
import { REFRESH_SESSION_SCHEMA } from "./sessions.schema";

@Injectable()
export class RefreshSessionsService implements IMongodbRepository<ISession> {

  private RefreshSessionModel: Model<ISession>;

  constructor(
    private mongodbRepository: MongodbRepository,
    private configService: ConfigService
  ) { }

  async onModuleInit(): Promise<void> {
    this.RefreshSessionModel = this.getModel() as Model<ISession>;
    await this.setModelIndexes();
  }

  async find(entityQuery?: IEntityQuery<ISession>): Promise<ISession[] | IPaginationResponse<ISession>> {
    try {
      return await this.mongodbRepository.find<ISession>(this.RefreshSessionModel, entityQuery);
    } catch (error) {
      throw formatMongodbError(error, 'RefreshSessionsService', 'find');
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<ISession | undefined> {
    const record: IMongodbRecord = { property, value };
    try {
      return await this.mongodbRepository.findOne<ISession>(this.RefreshSessionModel, record);
    } catch (error) {
      throw formatMongodbError(error, 'RefreshSessionsService', 'findOne');
    }
  }

  async save(refreshSession: ISession): Promise<ISession | undefined> {
    const value: Partial<ISession> = {
      user: refreshSession.user,
      jti: refreshSession.jti,
      expiresAt: refreshSession.expiresAt,
      isRevoked: refreshSession.isRevoked ?? false,
      revokedAt: refreshSession.revokedAt ?? undefined,
    };

    try {
      return await this.mongodbRepository.save<ISession>(this.RefreshSessionModel, value);
    } catch (error) {
      throw formatMongodbError(error, 'RefreshSessionsService', 'save');
    }
  }

  async updateOne(_id: string, refreshSession: ISession): Promise<ISession> {
    const record: IMongodbRecord = { property: '_id', value: _id };

    const value: Partial<ISession> = {
      user: refreshSession.user,
      jti: refreshSession.jti,
      expiresAt: refreshSession.expiresAt,
      isRevoked: refreshSession.isRevoked,
      revokedAt: refreshSession.revokedAt,
    };

    try {
      const result: ISession = await this.mongodbRepository
        .updateOne<ISession>(this.RefreshSessionModel, record, value) as ISession;
      if (!result) {
        throw new NotFoundException(`Refresh session not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'RefreshSessionsService', 'updateOne');
    }
  }

  async updateMany(filter: QueryFilter<ISession>, update: Partial<ISession>): Promise<number> {
    try {
      return await this.mongodbRepository
        .updateMany<ISession>(this.RefreshSessionModel, filter, update as Partial<ISession>);
    } catch (error) {
      throw formatMongodbError(error, 'RefreshSessionsService', 'updateMany');
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    const record: IMongodbRecord = { property: '_id', value: _id };
    try {
      const result: boolean = await this.mongodbRepository.deleteOne<ISession>(this.RefreshSessionModel, record);
      if (!result) {
        throw new NotFoundException(`Refresh session not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'RefreshSessionsService', 'deleteOne');
    }
  }

  async deleteMany(filter: QueryFilter<ISession>): Promise<number> {
    try {
      return await this.mongodbRepository.deleteMany(this.RefreshSessionModel, filter);
    } catch (error) {
      throw formatMongodbError(error, 'RefreshSessionsService', 'deleteMany');
    }
  }

  async findActiveUserSessionByJti(userId: string, jti: string): Promise<ISession | undefined> {
    try {
      return await this.RefreshSessionModel
        .findOne({ user: userId, jti, isRevoked: false })
        .exec() ?? undefined;
    } catch (error) {
      throw formatMongodbError(error, 'RefreshSessionsService', 'findActiveUserSessionByJti');
    }
  }

  async updateUserSession(user: IUser, jti: string): Promise<void> {
    const jwtConfig: IJwtConfig = this.configService.get('jwt') as IJwtConfig;

    const expiresAt: Date = new Date(Date.now() + parseDateUnits(jwtConfig?.refresh?.expiresIn as string));
    await this.save({
      user,
      jti,
      expiresAt,
      isRevoked: false,
      revokedAt: undefined
    });
  }

  async rotateUserSession(user: IUser, currentJti: string, newJti: string): Promise<void> {
    await this.updateMany(
      { user: user._id, jti: currentJti, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() }
    );

    await this.updateUserSession(user, newJti);
  }

  sessionIsExpired(refreshSession: ISession): boolean {
    return refreshSession.expiresAt < new Date();
  }

  getModel(): Model<ISession> | undefined {
    try {
      return this.mongodbRepository.getModel(
        MONGODB_CONSTANTS.REFRESH_SESSIONS.MODEL,
        REFRESH_SESSION_SCHEMA,
        MONGODB_CONSTANTS.REFRESH_SESSIONS.COLLECTION
      );
    } catch (error) {
      console.error(`[RefreshSessionsService] getModel -> Error: ${error}`);
      return undefined;
    }
  }

  async setModelIndexes(): Promise<void> {
    try {
      this.mongodbRepository.setModelIndexes(this.RefreshSessionModel);
    } catch (error) {
      console.error(`[RefreshSessionsService] setModelIndexes -> Error: ${error}`);
    }
  }
}
