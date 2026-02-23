import { DynamicModule, Module } from '@nestjs/common';
import { createAsyncConfigProvider, createConfigProvider } from '@shared/helpers';
import { IModuleAsyncConfig } from '@shared/interfaces';
import { EmailerTemplateService } from './emailer-templates.service';
import { IEmailerConfig } from './emailer.config';
import { EmailerService } from './emailer.service';

@Module({})
export class EmailerModule {
  static register(options: IEmailerConfig[]): DynamicModule {
    return {
      module: EmailerModule,
      providers: [
        ...createConfigProvider(options),
        EmailerService,
        EmailerTemplateService
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
        EmailerTemplateService
      ],
      exports: [
        EmailerService
      ],
      global: true
    };
  }
}