import { LoggerService } from "@core/logger";
import { formatMongodbError, MongodbRepository } from "@core/mongodb";
import { MAGIC_NUMBERS } from "@core/shared/constants";
import { IJwtConfig, IMongodbRecord, IMongodbRepository, IPaginationResponse } from "@core/shared/interfaces";
import { EntityQuery } from "@core/shared/types";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { COLLECTIONS } from "@shared/constants";
import { parseDateUnits } from "@shared/helpers";
import { ISession, IUser } from "@shared/interfaces";
import { Model, QueryFilter, SortOrder } from "mongoose";
import { SESSION_SCHEMA } from "./sessions.schema";

@Injectable()
export class SessionsService implements IMongodbRepository<ISession> {

  private SessionModel: Model<ISession>;

  constructor(
    private loggerService: LoggerService,
    private mongodbRepository: MongodbRepository,
    private configService: ConfigService
  ) { }

  async onModuleInit(): Promise<void> {
    this.SessionModel = this.getModel() as Model<ISession>;
    await this.setModelIndexes();
  }

  async find(entityQuery?: EntityQuery<ISession>): Promise<ISession[] | IPaginationResponse<ISession>> {
    try {
      return await this.mongodbRepository.find<ISession>(this.SessionModel, entityQuery);
    } catch (error) {
      throw formatMongodbError(error, 'SessionsService', 'find', this.loggerService);
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<ISession | undefined> {
    const record: IMongodbRecord = { property, value };
    try {
      return await this.mongodbRepository.findOne<ISession>(this.SessionModel, record);
    } catch (error) {
      throw formatMongodbError(error, 'SessionsService', 'findOne', this.loggerService);
    }
  }

  async save(session: ISession): Promise<ISession | undefined> {
    const value: Partial<ISession> = {
      user: session.user,
      accessJti: session.accessJti,
      accessExpiresAt: session.accessExpiresAt,
      refreshJti: session.refreshJti ?? undefined,
      refreshExpiresAt: session.refreshExpiresAt ?? undefined,
      isRevoked: session.isRevoked ?? false,
      isAccessRevoked: session.isAccessRevoked ?? false,
      isRefreshRevoked: session.isRefreshRevoked ?? false,
      revokedAt: session.revokedAt ?? undefined,
    };

    try {
      return await this.mongodbRepository.save<ISession>(this.SessionModel, value);
    } catch (error) {
      throw formatMongodbError(error, 'SessionsService', 'save', this.loggerService);
    }
  }

  async updateOne(_id: string, session: ISession): Promise<ISession> {
    const record: IMongodbRecord = { property: '_id', value: _id };

    const value: Partial<ISession> = {
      user: session.user,
      accessJti: session.accessJti,
      accessExpiresAt: session.accessExpiresAt,
      refreshJti: session.refreshJti,
      refreshExpiresAt: session.refreshExpiresAt,
      isRevoked: session.isRevoked,
      isAccessRevoked: session.isAccessRevoked ?? false,
      isRefreshRevoked: session.isRefreshRevoked ?? false,
      revokedAt: session.revokedAt,
    };

    try {
      const result: ISession = await this.mongodbRepository
        .updateOne<ISession>(this.SessionModel, record, value) as ISession;
      if (!result) {
        throw new NotFoundException(`Session not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'SessionsService', 'updateOne', this.loggerService);
    }
  }

  async updateMany(filter: QueryFilter<ISession>, update: Partial<ISession>): Promise<number> {
    try {
      return await this.mongodbRepository
        .updateMany<ISession>(this.SessionModel, filter, update as Partial<ISession>);
    } catch (error) {
      throw formatMongodbError(error, 'SessionsService', 'updateMany', this.loggerService);
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    const record: IMongodbRecord = { property: '_id', value: _id };
    try {
      const result: boolean = await this.mongodbRepository.deleteOne<ISession>(this.SessionModel, record);
      if (!result) {
        throw new NotFoundException(`Session not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'SessionsService', 'deleteOne', this.loggerService);
    }
  }

  async deleteMany(filter: QueryFilter<ISession>): Promise<number> {
    try {
      return await this.mongodbRepository.deleteMany(this.SessionModel, filter);
    } catch (error) {
      throw formatMongodbError(error, 'SessionsService', 'deleteMany', this.loggerService);
    }
  }

  async findLastActiveUserSession(userId: string): Promise<ISession | undefined> {
    try {
      return await this.SessionModel
        .findOne({ user: userId, isRevoked: false })
        .sort({ createdAt: MAGIC_NUMBERS.N_MINUS_1 as SortOrder })
        .exec() ?? undefined;
    } catch (error) {
      throw formatMongodbError(error, 'SessionsService', 'findLastActiveUserSession', this.loggerService);
    }
  }

  async findActiveSessionByRefreshJti(userId: string, refreshJti: string): Promise<ISession | undefined> {
    try {
      return await this.SessionModel
        .findOne({ user: userId, refreshJti, isRevoked: false, isRefreshRevoked: false })
        .exec() ?? undefined;
    } catch (error) {
      throw formatMongodbError(error, 'SessionsService', 'findActiveSessionByRefreshJti', this.loggerService);
    }
  }

  async findActiveSessionByAccessJti(userId: string, accessJti: string): Promise<ISession | undefined> {
    try {
      return await this.SessionModel
        .findOne({ user: userId, accessJti, isRevoked: false, isAccessRevoked: false })
        .exec() ?? undefined;
    } catch (error) {
      throw formatMongodbError(error, 'SessionsService', 'findActiveSessionByAccessJti', this.loggerService);
    }
  }

  async updateUserSession(user: IUser, accessJti: string, refreshJti?: string): Promise<void> {
    const jwtConfig: IJwtConfig = this.configService.get('jwt') as IJwtConfig;

    await this.updateMany(
      { user: user._id, isRevoked: false },
      {
        isRevoked: true,
        isAccessRevoked: true,
        isRefreshRevoked: true,
        revokedAt: new Date()
      }
    );

    const accessExpiresAt: Date = new Date(Date.now() + parseDateUnits(jwtConfig?.signOptions?.expiresIn));
    const refreshExpiresAt: Date | undefined = refreshJti
      ? new Date(Date.now() + parseDateUnits(jwtConfig?.refresh?.expiresIn as string))
      : undefined;

    await this.save({
      user,
      accessJti,
      accessExpiresAt,
      refreshJti,
      refreshExpiresAt,
      isRevoked: false,
      isAccessRevoked: false,
      isRefreshRevoked: false,
      revokedAt: undefined
    });
  }

  async rotateSession(_id: string, accessJti: string, refreshJti: string): Promise<ISession> {
    const session: ISession = await this.findOne(_id) as ISession;
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const jwtConfig: IJwtConfig = this.configService.get('jwt') as IJwtConfig;
    session.accessJti = accessJti;
    session.accessExpiresAt = new Date(Date.now() + parseDateUnits(jwtConfig?.signOptions?.expiresIn));
    session.refreshJti = refreshJti;
    session.refreshExpiresAt = new Date(Date.now() + parseDateUnits(jwtConfig?.refresh?.expiresIn as string));
    session.isAccessRevoked = false;
    session.isRefreshRevoked = false;

    return await this.updateOne(_id, session);
  }

  sessionIsExpired(session: ISession): boolean {
    return session.accessExpiresAt < new Date();
  }

  refreshSessionIsExpired(session: ISession): boolean {
    return !session.refreshExpiresAt || session.refreshExpiresAt < new Date();
  }

  getModel(): Model<ISession> | undefined {
    try {
      return this.mongodbRepository.getModel(
        COLLECTIONS.SESSIONS.MODEL,
        SESSION_SCHEMA,
        COLLECTIONS.SESSIONS.COLLECTION
      );
    } catch (error) {
      this.loggerService.error(`[SessionsService] getModel -> Error: ${error}`);
      return undefined;
    }
  }

  async setModelIndexes(): Promise<void> {
    try {
      this.mongodbRepository.setModelIndexes(this.SessionModel);
    } catch (error) {
      this.loggerService.error(`[SessionsService] setModelIndexes -> Error: ${error}`);
    }
  }
}
