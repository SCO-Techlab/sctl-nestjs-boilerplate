import { IMongodbEnvConfig } from '@env-configs/mongodb';
import { DynamicModule, Module } from '@nestjs/common';
import { createAsyncConfigProvider, createConfigProvider } from '@shared/helpers';
import { IModuleAsyncConfig } from '@shared/interfaces';
import { MongodbService } from './mongodb.service';

@Module({})
export class MongodbModule {
  static register(options: IMongodbEnvConfig[]): DynamicModule {
    return {
      module: MongodbModule,
      providers: [
        ...createConfigProvider(options),
        MongodbService,
      ],
      exports: [
        MongodbService
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
      ],
      exports: [
        MongodbService
      ],
      global: true
    };
  }
}
