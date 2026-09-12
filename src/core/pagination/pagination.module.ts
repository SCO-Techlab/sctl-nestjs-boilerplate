import { DynamicModule, Module } from '@nestjs/common';
import { PaginationService } from './pagination.service';

@Module({})
export class PaginationModule {
  static register(): DynamicModule {
    return {
      module: PaginationModule,
      providers: [
        PaginationService
      ],
      exports: [
        PaginationService
      ],
      global: true,
    };
  }

  public static registerAsync(): DynamicModule {
    return {
      module: PaginationModule,
      providers: [
        PaginationService
      ],
      exports: [
        PaginationService
      ],
      global: true,
    };
  }
}