import { Injectable } from "@nestjs/common";
import { MAGIC_NUMBERS } from "@shared/constants";
import { IMongodbRecord, IPaginationResponse } from "@shared/interfaces";
import { PaginationService } from "@shared/services";
import { IEntityQuery } from "@shared/types";
import { Model, QueryFilter, Schema } from "mongoose";
import { MongodbService } from "./mongodb.service";

@Injectable()
export class MongodbRepository {

  constructor(
    private mongodbService: MongodbService,
    private paginationService: PaginationService
  ) { }

  public getModel<T>(model: string, schema: Schema<T>, collection: string): Model<T> {
    try {
      return this.mongodbService.getModel<T>(
        model,
        schema,
        collection
      ) as Model<T>;
    } catch (error) {
      throw error;
    }
  }

  public async setModelIndexes<T>(Model: Model<T>): Promise<void> {
    if (!Model) {
      return;
    }

    try {
      await Model.createIndexes();
    } catch (error) {
      throw error;
    }
  }

  public async find<T>(Model: Model<T>, entityQuery?: IEntityQuery<T>): Promise<T[] | IPaginationResponse<T>> {
    const query: IEntityQuery<T> = { ...(entityQuery || {}) } as IEntityQuery<T>;
    const { page, limit } = query;

    try {
      if (page === undefined || limit === undefined) {
        const result: T[] = await Model.find(query);
        return result ?? [];
      }

      delete query?.page;
      delete query?.limit;

      const totalRecords = await Model.countDocuments(query).exec();
      const { totalPages, finalPage, skip, sanitizedLimit } = this.paginationService.paginationParams(page, limit, totalRecords);

      const data = await Model
        .find(query)
        .skip(skip)
        .limit(sanitizedLimit);

      return {
        data: data ?? [],
        totalRecords: totalRecords,
        currentPage: finalPage,
        totalPages: totalPages,
        limit: sanitizedLimit,
        first: (finalPage - MAGIC_NUMBERS.N_1) * sanitizedLimit
      };
    } catch (error) {
      throw error;
    }
  }

  public async findOne<T>(Model: Model<T>, record: IMongodbRecord): Promise<T | undefined> {
    try {
      const result = await Model.findOne({ [record.property]: record.value });
      return result ?? undefined;
    } catch (error) {
      throw error;
    }
  }

  public async save<T>(Model: Model<T>, value: Partial<T>): Promise<T | undefined> {
    const NewModelValue = new Model(value);
    try {
      const result = await NewModelValue.save() as T;
      return result ?? undefined;
    } catch (error) {
      throw error;
    }
  }

  public async updateOne<T>(Model: Model<T>, record: IMongodbRecord, value: Partial<T>): Promise<T | undefined> {
    try {
      const updatedValue = await Model.findOneAndUpdate(
        {
          [record.property]: record.value
        },
        {
          $set: value
        },
        {
          returnDocument: 'after',
          runValidators: true
        }
      );

      return updatedValue ?? undefined;
    } catch (error) {
      throw error;
    }
  }

  public async updateMany<T>(Model: Model<T>, filter: QueryFilter<T>, update: Partial<T>): Promise<number> {
    try {
      const result = await Model.updateMany(
        filter,
        { $set: update },
        { runValidators: true }
      );

      return result?.modifiedCount ?? MAGIC_NUMBERS.N_0;
    } catch (error) {
      throw error;
    }
  }

  public async deleteOne<T>(Model: Model<T>, record: IMongodbRecord): Promise<boolean> {
    try {
      const result = await Model.deleteOne({ [record.property]: record.value });
      if (result?.deletedCount !== MAGIC_NUMBERS.N_1) {
        return false;
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  public async deleteMany<T>(Model: Model<T>, filter: QueryFilter<T>): Promise<number> {
    try {
      const result = await Model.deleteMany(filter);
      return result?.deletedCount ?? MAGIC_NUMBERS.N_0;
    } catch (error) {
      throw error;
    }
  }
}
