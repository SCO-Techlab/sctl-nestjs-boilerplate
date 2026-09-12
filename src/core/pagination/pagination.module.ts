import { DynamicModule, Module } from '@nestjs/common';

@Module({})
export class PaginationModule {
  static register(): DynamicModule {
    return {
      module: PaginationModule,
      imports: [

      ],
      providers: [

      ],
      exports: [

      ],
      global: true,
    };
  }

  public static registerAsync(): DynamicModule {
    return {
      module: PaginationModule,
      imports: [

      ],
      providers: [

      ],
      exports: [

      ],
      global: true,
    };
  }
}