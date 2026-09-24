import { LoggerService } from '@core/logger';
import { formatMongodbError, IMongodbRecord, IMongodbRepository, MongodbRepository } from '@core/mongodb';
import { IPaginationResponse } from '@core/pagination';
import { EntityQuery } from '@core/shared/types';
import { ResidencesRepository } from '@domains/residences';
import { TenantsRepository } from '@domains/tenants';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { COLLECTIONS } from '@shared/constants';
import { IResidence, IRoom, ITenant } from '@shared/interfaces';
import { Model, QueryFilter } from 'mongoose';
import { RoomDto } from './rooms.dto';
import { ROOMS_SCHEMA } from './rooms.schema';

@Injectable()
export class RoomsRepository implements IMongodbRepository<IRoom> {
  private Model: Model<IRoom>;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly mongodbRepository: MongodbRepository,
    private readonly tenantsRepository: TenantsRepository,
    private readonly residencesRepository: ResidencesRepository,
  ) { }

  async onModuleInit(): Promise<void> {
    try {
      this.Model = this.mongodbRepository.getModel(COLLECTIONS.ROOMS.MODEL, ROOMS_SCHEMA, COLLECTIONS.ROOMS.COLLECTION);
      await this.mongodbRepository.setModelIndexes(this.Model);
    } catch (error) {
      this.loggerService.error(`[RoomsRepository] onModuleInit -> Error: ${error}`);
    }
  }

  async find(entityQuery?: EntityQuery<IRoom>): Promise<IRoom[] | IPaginationResponse<IRoom>> {
    try {
      return await this.mongodbRepository.find<IRoom>(this.Model, entityQuery);
    } catch (error) {
      throw formatMongodbError(error, 'RoomsRepository', 'find', this.loggerService);
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<IRoom | undefined> {
    const record: IMongodbRecord = { property, value };
    try {
      return await this.mongodbRepository.findOne<IRoom>(this.Model, record);
    } catch (error) {
      throw formatMongodbError(error, 'RoomsRepository', 'findOne', this.loggerService);
    }
  }

  async save(newValue: IRoom | Partial<IRoom>): Promise<IRoom | undefined> {
    try {
      return await this.mongodbRepository.save<IRoom>(this.Model, newValue);
    } catch (error) {
      throw formatMongodbError(error, 'RoomsRepository', 'save', this.loggerService);
    }
  }

  async updateOne(_id: string, updateValue: IRoom | Partial<IRoom>): Promise<IRoom> {
    const record: IMongodbRecord = { property: '_id', value: _id };
    const value: Partial<IRoom> = {
      tenant: updateValue.tenant,
      residence: updateValue.residence,
      name: updateValue.name,
      beds: updateValue.beds,
      images: updateValue.images,
    };

    try {
      const result: IRoom = await this.mongodbRepository.updateOne<IRoom>(this.Model, record, value) as IRoom;
      if (!result) {
        throw new NotFoundException('Room not found');
      }
      return result;
    } catch (error) {
      throw formatMongodbError(error, 'RoomsRepository', 'updateOne', this.loggerService);
    }
  }

  async updateMany(filter: QueryFilter<IRoom>, update: IRoom | Partial<IRoom>): Promise<number> {
    try {
      return await this.mongodbRepository.updateMany<IRoom>(this.Model, filter, update as Partial<IRoom>);
    } catch (error) {
      throw formatMongodbError(error, 'RoomsRepository', 'updateMany', this.loggerService);
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    const record: IMongodbRecord = { property: '_id', value: _id };
    try {
      const result: boolean = await this.mongodbRepository.deleteOne<IRoom>(this.Model, record);
      if (!result) {
        throw new NotFoundException('Room not found');
      }
      return result;
    } catch (error) {
      throw formatMongodbError(error, 'RoomsRepository', 'deleteOne', this.loggerService);
    }
  }

  async deleteMany(filter: QueryFilter<IRoom>): Promise<number> {
    try {
      return await this.mongodbRepository.deleteMany(this.Model, filter);
    } catch (error) {
      throw formatMongodbError(error, 'RoomsRepository', 'deleteMany', this.loggerService);
    }
  }

  async dtoToEntity(dto: RoomDto): Promise<IRoom | undefined> {
    const keys: string[] = Object.keys(dto ?? {});
    if (!keys?.length) {
      return undefined;
    }

    const existRecord: IRoom | undefined = dto?._id ? await this.findOne(dto._id, '_id') : undefined;

    const tenantValue = dto?.tenant ?? (existRecord ? String(existRecord.tenant?._id ?? existRecord.tenant) : undefined);
    const residenceValue = dto?.residence ?? (existRecord ? String(existRecord.residence?._id ?? existRecord.residence) : undefined);

    const existTenant: ITenant | undefined = tenantValue ? await this.tenantsRepository.findOne(tenantValue, '_id') : undefined;
    if (tenantValue && !existTenant) {
      throw new BadRequestException(`Tenant with ID ${tenantValue} does not exist`);
    }

    const existResidence: IResidence | undefined = residenceValue ? await this.residencesRepository.findOne(residenceValue, '_id') : undefined;
    if (residenceValue && !existResidence) {
      throw new BadRequestException(`Residence with ID ${residenceValue} does not exist`);
    }

    const entity: IRoom = {
      _id: dto?._id ?? existRecord?._id ?? undefined,
      tenant: (existTenant ?? (existRecord?.tenant as ITenant | undefined) ?? undefined) as ITenant,
      residence: (existResidence ?? (existRecord?.residence as IResidence | undefined) ?? undefined) as IResidence,
      name: dto?.name ?? existRecord?.name ?? undefined,
      beds: dto?.beds ?? existRecord?.beds ?? undefined,
      images: dto?.images ?? existRecord?.images ?? undefined,
      createdAt: dto?.createdAt ?? existRecord?.createdAt ?? undefined,
      updatedAt: dto?.updatedAt ?? existRecord?.updatedAt ?? undefined,
      __v: dto?.__v ?? existRecord?.__v ?? undefined,
    };

    return entity;
  }
}
