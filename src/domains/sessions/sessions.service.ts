import { IUser } from "@domains/users";
import { IJwtConfig } from "@modules/jwt";
import { MongodbRepository } from "@modules/mongodb";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MAGIC_NUMBERS, MONGODB_CONSTANTS } from "@shared/constants";
import { formatMongodbError, parseDateUnits } from "@shared/helpers";
import { IMongodbRecord, IMongodbRepository, IPaginationResponse } from "@shared/interfaces";
import { IEntityQuery } from "@shared/types";
import { Model, QueryFilter, SortOrder } from "mongoose";
import { ISession } from "./sessions.interface";
import { SESSION_SCHEMA } from "./sessions.schema";

@Injectable()
export class SessionsService implements IMongodbRepository<ISession> {

  private SessionModel: Model<ISession>;

  constructor(
    private mongodbRepository: MongodbRepository,
    private configService: ConfigService
  ) { }

  async onModuleInit(): Promise<void> {
    this.SessionModel = this.getModel() as Model<ISession>;
    await this.setModelIndexes();
  }

  async find(entityQuery?: IEntityQuery<ISession>): Promise<ISession[] | IPaginationResponse<ISession>> {
    try {
      return await this.mongodbRepository.find<ISession>(this.SessionModel, entityQuery);
    } catch (error) {
      throw formatMongodbError(error, 'SessionsService', 'find');
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<ISession | undefined> {
    const record: IMongodbRecord = { property, value };
    try {
      return await this.mongodbRepository.findOne<ISession>(this.SessionModel, record);
    } catch (error) {
      throw formatMongodbError(error, 'SessionsService', 'findOne');
    }
  }

  async save(session: ISession): Promise<ISession | undefined> {
    const value: Partial<ISession> = {
      user: session.user,
      jti: session.jti,
      expiresAt: session.expiresAt,
      isRevoked: session.isRevoked ?? false,
      revokedAt: session.revokedAt ?? undefined,
    };

    try {
      return await this.mongodbRepository.save<ISession>(this.SessionModel, value);
    } catch (error) {
      throw formatMongodbError(error, 'SessionsService', 'save');
    }
  }

  async updateOne(_id: string, session: ISession): Promise<ISession> {
    const record: IMongodbRecord = { property: '_id', value: _id };

    const value: Partial<ISession> = {
      user: session.user,
      jti: session.jti,
      expiresAt: session.expiresAt,
      isRevoked: session.isRevoked,
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
      throw formatMongodbError(error, 'SessionsService', 'updateOne');
    }
  }

  async updateMany(filter: QueryFilter<ISession>, update: Partial<ISession>): Promise<number> {
    try {
      return await this.mongodbRepository
        .updateMany<ISession>(this.SessionModel, filter, update as Partial<ISession>);
    } catch (error) {
      throw formatMongodbError(error, 'SessionsService', 'updateMany');
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
      throw formatMongodbError(error, 'SessionsService', 'deleteOne');
    }
  }

  async deleteMany(filter: QueryFilter<ISession>): Promise<number> {
    try {
      return await this.mongodbRepository.deleteMany(this.SessionModel, filter);
    } catch (error) {
      throw formatMongodbError(error, 'SessionsService', 'deleteMany');
    }
  }

  async findLastActiveUserSession(userId: string): Promise<ISession | undefined> {
    try {
      return await this.SessionModel
        .findOne({ user: userId, isRevoked: false })
        .sort({ createdAt: MAGIC_NUMBERS.N_MINUS_1 as SortOrder })
        .exec() ?? undefined;
    } catch (error) {
      throw formatMongodbError(error, 'SessionsService', 'findLastActiveUserSession');
    }
  }

  async updateUserSession(user: IUser, jti: string): Promise<void> {
    const jwtConfig: IJwtConfig = this.configService.get('jwt') as IJwtConfig;

    await this.updateMany(
      { user: user._id, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() }
    );

    const expiresAt: Date = new Date(Date.now() + parseDateUnits(jwtConfig?.signOptions?.expiresIn));
    await this.save({
      user,
      jti,
      expiresAt,
      isRevoked: false,
      revokedAt: undefined
    });
  }

  sessionIsExpired(session: ISession): boolean {
    return session.expiresAt < new Date();
  }

  getModel(): Model<ISession> | undefined {
    try {
      return this.mongodbRepository.getModel(
        MONGODB_CONSTANTS.SESSIONS.MODEL,
        SESSION_SCHEMA,
        MONGODB_CONSTANTS.SESSIONS.COLLECTION
      );
    } catch (error) {
      console.error(`[SessionsService] getModel -> Error: ${error}`);
      return undefined;
    }
  }

  async setModelIndexes(): Promise<void> {
    try {
      this.mongodbRepository.setModelIndexes(this.SessionModel);
    } catch (error) {
      console.error(`[SessionsService] setModelIndexes -> Error: ${error}`);
    }
  }
}
