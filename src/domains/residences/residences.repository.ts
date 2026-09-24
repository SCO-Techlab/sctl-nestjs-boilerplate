import { LoggerService } from "@core/logger";
import { formatMongodbError, IMongodbRecord, IMongodbRepository, MongodbRepository } from "@core/mongodb";
import { IPaginationResponse } from "@core/pagination";
import { EntityQuery } from "@core/shared/types";
import { TenantsRepository } from "@domains/tenants";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { COLLECTIONS } from "@shared/constants";
import { IResidence, ITenant } from "@shared/interfaces";
import { Model, QueryFilter } from "mongoose";
import { ResidenceDto } from "./residences.dto";
import { RESIDENCES_SCHEMA } from "./residences.schema";

@Injectable()
export class ResidencesRepository implements IMongodbRepository<IResidence> {

  private Model: Model<IResidence>;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly mongodbRepository: MongodbRepository,
    private readonly tenantsRepository: TenantsRepository
  ) { }

  async onModuleInit(): Promise<void> {
    try {
      this.Model = this.mongodbRepository.getModel(COLLECTIONS.RESIDENCES.MODEL, RESIDENCES_SCHEMA, COLLECTIONS.RESIDENCES.COLLECTION);
      await this.mongodbRepository.setModelIndexes(this.Model);
    } catch (error) {
      this.loggerService.error(`[ResidencesRepository] onModuleInit -> Error: ${error}`);
    }
  }

  async find(entityQuery?: EntityQuery<IResidence>): Promise<IResidence[] | IPaginationResponse<IResidence>> {
    try {
      return await this.mongodbRepository.find<IResidence>(this.Model, entityQuery);
    } catch (error) {
      throw formatMongodbError(error, 'ResidencesRepository', 'find', this.loggerService);
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<IResidence | undefined> {
    const record: IMongodbRecord = { property, value };
    try {
      return await this.mongodbRepository.findOne<IResidence>(this.Model, record);
    } catch (error) {
      throw formatMongodbError(error, 'ResidencesRepository', 'findOne', this.loggerService);
    }
  }

  async save(newValue: IResidence | Partial<IResidence>): Promise<IResidence | undefined> {
    try {
      return await this.mongodbRepository.save<IResidence>(this.Model, newValue);
    } catch (error) {
      throw formatMongodbError(error, 'ResidencesRepository', 'save', this.loggerService);
    }
  }

  async updateOne(_id: string, updateValue: IResidence | Partial<IResidence>): Promise<IResidence> {
    const record: IMongodbRecord = { property: '_id', value: _id };
    try {
      const value: Partial<IResidence> = {
        street: updateValue.street,
        number: updateValue.number,
        flat: updateValue.flat,
        door: updateValue.door,
        city: updateValue.city,
        province: updateValue.province,
        postalCode: updateValue.postalCode,
        cadastre: updateValue.cadastre,
        description: updateValue.description,
        images: updateValue.images
      };

      const result: IResidence = await this.mongodbRepository.updateOne<IResidence>(this.Model, record, value) as IResidence;
      if (!result) {
        throw new NotFoundException(`Residence not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'ResidencesRepository', 'updateOne', this.loggerService);
    }
  }

  async updateMany(filter: QueryFilter<IResidence>, update: IResidence | Partial<IResidence>): Promise<number> {
    try {
      return await this.mongodbRepository.updateMany<IResidence>(this.Model, filter, update as Partial<IResidence>);
    } catch (error) {
      throw formatMongodbError(error, 'ResidencesRepository', 'updateMany', this.loggerService);
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    const record: IMongodbRecord = { property: '_id', value: _id };
    try {
      const result: boolean = await this.mongodbRepository.deleteOne<IResidence>(this.Model, record);
      if (!result) {
        throw new NotFoundException(`Residence not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'ResidencesRepository', 'deleteOne', this.loggerService);
    }
  }

  async deleteMany(filter: QueryFilter<IResidence>): Promise<number> {
    try {
      return await this.mongodbRepository.deleteMany(this.Model, filter);
    } catch (error) {
      throw formatMongodbError(error, 'ResidencesRepository', 'deleteMany', this.loggerService);
    }
  }

  async dtoToEntity(dto: ResidenceDto): Promise<IResidence | undefined> {
    const keys: string[] = Object.keys(dto ?? {});
    if (!keys?.length) {
      return undefined;
    }

    if (dto?._id) {
      const existRecord = await this.findOne(dto._id, '_id');
      if (existRecord) {
        return existRecord;
      }
    }

    const existTenant: ITenant | undefined = await this.tenantsRepository.findOne(dto.tenant, '_id');
    if (!existTenant) {
      throw new BadRequestException(`Tenant with ID ${dto.tenant} does not exist`);
    }

    const entity: IResidence = {
      _id: dto?._id ?? undefined,
      tenant: existTenant,
      street: dto?.street ?? undefined,
      number: dto?.number ?? undefined,
      flat: dto?.flat ?? undefined,
      door: dto?.door ?? undefined,
      city: dto?.city ?? undefined,
      province: dto?.province ?? undefined,
      postalCode: dto?.postalCode ?? undefined,
      cadastre: dto?.cadastre ?? undefined,
      description: dto?.description ?? undefined,
      images: dto?.images ?? undefined,
      createdAt: dto?.createdAt ?? undefined,
      updatedAt: dto?.updatedAt ?? undefined,
      __v: dto?.__v ?? undefined
    };

    return entity;
  }
}
