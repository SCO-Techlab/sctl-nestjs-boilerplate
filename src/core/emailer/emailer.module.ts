import { createAsyncConfigProvider, createConfigProvider } from '@core/shared/helpers';
import { IEmailerConfig, IModuleAsyncConfig } from '@core/shared/interfaces';
import { DynamicModule, Module } from '@nestjs/common';
import { EmailerRenderService } from './emailer-render.service';
import { EmailerService } from './emailer.service';

@Module({})
export class EmailerModule {
  static register(options: IEmailerConfig[]): DynamicModule {
    return {
      module: EmailerModule,
      providers: [
        ...createConfigProvider(options),
        EmailerService,
        EmailerRenderService
      ],
      exports: [
        EmailerService
      ],
      global: true
    };
  }

  public static registerAsync(options: IModuleAsyncConfig): DynamicModule {
    return {
      module: EmailerModule,
      providers: [
        ...createAsyncConfigProvider(options),
        EmailerService,
        EmailerRenderService
      ],
      exports: [
        EmailerService
      ],
      global: true
    };
  }
}