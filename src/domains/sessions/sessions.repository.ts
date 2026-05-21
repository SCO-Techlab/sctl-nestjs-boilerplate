import { LoggerService } from "@core/logger";
import { formatMongodbError, MongodbRepository } from "@core/mongodb";
import { IMongodbRecord, IMongodbRepository, IPaginationResponse } from "@core/shared/interfaces";
import { EntityQuery } from "@core/shared/types";
import { Injectable, NotFoundException } from "@nestjs/common";
import { COLLECTIONS } from "@shared/constants";
import { ISession } from "@shared/interfaces";
import { Model, QueryFilter } from "mongoose";
import { SESSION_SCHEMA } from "./sessions.schema";

@Injectable()
export class SessionsRepository implements IMongodbRepository<ISession> {

  public get Model(): Model<ISession> {
    return this._Model;
  }

  private _Model: Model<ISession>;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly mongodbRepository: MongodbRepository
  ) { }

  async onModuleInit(): Promise<void> {
    try {
      this._Model = this.mongodbRepository.getModel(COLLECTIONS.SESSIONS.MODEL, SESSION_SCHEMA, COLLECTIONS.SESSIONS.COLLECTION);
      await this.mongodbRepository.setModelIndexes(this._Model);
    } catch (error) {
      this.loggerService.error(`[SessionsRepository] onModuleInit -> Error: ${error}`);
    }
  }

  async find(entityQuery?: EntityQuery<ISession>): Promise<ISession[] | IPaginationResponse<ISession>> {
    try {
      return await this.mongodbRepository.find<ISession>(this._Model, entityQuery);
    } catch (error) {
      throw formatMongodbError(error, 'SessionsRepository', 'find', this.loggerService);
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<ISession | undefined> {
    const record: IMongodbRecord = { property, value };
    try {
      return await this.mongodbRepository.findOne<ISession>(this._Model, record);
    } catch (error) {
      throw formatMongodbError(error, 'SessionsRepository', 'findOne', this.loggerService);
    }
  }

  async save(newValue: ISession | Partial<ISession>): Promise<ISession | undefined> {
    const value: Partial<ISession> = {
      user: newValue.user,
      accessJti: newValue.accessJti,
      accessExpiresAt: newValue.accessExpiresAt,
      refreshJti: newValue.refreshJti ?? undefined,
      refreshExpiresAt: newValue.refreshExpiresAt ?? undefined,
      isRevoked: newValue.isRevoked ?? false,
      isAccessRevoked: newValue.isAccessRevoked ?? false,
      isRefreshRevoked: newValue.isRefreshRevoked ?? false,
      revokedAt: newValue.revokedAt ?? undefined,
    };

    try {
      return await this.mongodbRepository.save<ISession>(this._Model, value);
    } catch (error) {
      throw formatMongodbError(error, 'SessionsRepository', 'save', this.loggerService);
    }
  }

  async updateOne(_id: string, updateValue: ISession | Partial<ISession>): Promise<ISession> {
    const record: IMongodbRecord = { property: '_id', value: _id };

    const value: Partial<ISession> = {
      user: updateValue.user,
      accessJti: updateValue.accessJti,
      accessExpiresAt: updateValue.accessExpiresAt,
      refreshJti: updateValue.refreshJti,
      refreshExpiresAt: updateValue.refreshExpiresAt,
      isRevoked: updateValue.isRevoked,
      isAccessRevoked: updateValue.isAccessRevoked ?? false,
      isRefreshRevoked: updateValue.isRefreshRevoked ?? false,
      revokedAt: updateValue.revokedAt,
    };

    try {
      const result: ISession = await this.mongodbRepository
        .updateOne<ISession>(this._Model, record, value) as ISession;
      if (!result) {
        throw new NotFoundException(`Session not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'SessionsRepository', 'updateOne', this.loggerService);
    }
  }

  async updateMany(filter: QueryFilter<ISession>, update: ISession | Partial<ISession>): Promise<number> {
    try {
      return await this.mongodbRepository
        .updateMany<ISession>(this._Model, filter, update as Partial<ISession>);
    } catch (error) {
      throw formatMongodbError(error, 'SessionsRepository', 'updateMany', this.loggerService);
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    const record: IMongodbRecord = { property: '_id', value: _id };
    try {
      const result: boolean = await this.mongodbRepository.deleteOne<ISession>(this._Model, record);
      if (!result) {
        throw new NotFoundException(`Session not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'SessionsRepository', 'deleteOne', this.loggerService);
    }
  }

  async deleteMany(filter: QueryFilter<ISession>): Promise<number> {
    try {
      return await this.mongodbRepository.deleteMany(this._Model, filter);
    } catch (error) {
      throw formatMongodbError(error, 'SessionsRepository', 'deleteMany', this.loggerService);
    }
  }

  async dtoToEntity(dto: any): Promise<ISession | undefined> {
    throw new Error('Method not implemented.');
  }
}
