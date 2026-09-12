import { IModuleAsyncConfig } from "@core/shared";
import { createAsyncConfigProvider, createConfigProvider } from "@core/shared/helpers";
import { DynamicModule, Module } from "@nestjs/common";
import { IGridfsConfig } from "./gridfs.interface";
import { GridfsManagerService } from "./gridfs.manager";
import { GridfsService } from "./gridfs.service";
import { GridfsUtilsService } from "./gridfs.utils.service";

@Module({})
export class GridfsModule {
  static register(options: IGridfsConfig): DynamicModule {
    return {
      module: GridfsModule,
      providers: [
        ...createConfigProvider(options),
        GridfsService,
        GridfsManagerService,
        GridfsUtilsService
      ],
      exports: [
        GridfsService
      ],
      global: true
    };
  }

  public static registerAsync(options: IModuleAsyncConfig): DynamicModule {
    return {
      module: GridfsModule,
      providers: [
        ...createAsyncConfigProvider(options),
        GridfsService,
        GridfsManagerService,
        GridfsUtilsService
      ],
      exports: [
        GridfsService
      ],
      global: true
    };
  }
}