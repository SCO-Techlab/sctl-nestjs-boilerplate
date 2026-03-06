import { DynamicModule, Module } from '@nestjs/common';
import { createAsyncConfigProvider, createConfigProvider } from '@shared/helpers';
import { IModuleAsyncConfig } from '@shared/interfaces';
import { PaginationService } from '@shared/services';
import { IMongodbConfig } from './mongodb.config';
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
