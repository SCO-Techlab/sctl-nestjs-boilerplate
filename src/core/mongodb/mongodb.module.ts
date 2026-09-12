import { PaginationService } from '@core/pagination';
import { createAsyncConfigProvider, createConfigProvider } from '@core/shared/helpers';
import { IModuleAsyncConfig } from '@core/shared/interfaces';
import { DynamicModule, Module } from '@nestjs/common';
import { IMongodbConfig } from './mongodb.interface';
import { MongodbRepository } from './mongodb.repository';
import { MongodbService } from './mongodb.service';

@Module({})
export class MongodbModule {
  static register(options: IMongodbConfig[]): DynamicModule {
    return {
      module: MongodbModule,
      providers: [
        ...createConfigProvider(options),
        MongodbService,
        MongodbRepository,
        PaginationService
      ],
      exports: [
        MongodbService,
        MongodbRepository
      ],
      global: true
    };
  }

  public static registerAsync(options: IModuleAsyncConfig): DynamicModule {
    return {
      module: MongodbModule,
      providers: [
        ...createAsyncConfigProvider(options),
        MongodbService,
        MongodbRepository,
        PaginationService
      ],
      exports: [
        MongodbService,
        MongodbRepository
      ],
      global: true
    };
  }
}
