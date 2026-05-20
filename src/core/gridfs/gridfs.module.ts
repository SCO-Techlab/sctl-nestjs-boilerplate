import { createAsyncConfigProvider, createConfigProvider } from "@core/shared/helpers";
import { IGridfsConfig, IModuleAsyncConfig } from "@core/shared/interfaces";
import { DynamicModule, Module } from "@nestjs/common";
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