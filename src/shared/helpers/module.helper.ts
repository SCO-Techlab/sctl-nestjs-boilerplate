import { Provider } from "@nestjs/common";
import { IModuleAsyncConfig, IModuleConfigFactory } from "../interfaces";

export const PROVIDER_CONFIG: string = 'CONFIG_OPTIONS';

export const createAsyncConfigProvider = (options: IModuleAsyncConfig): Provider[] => {
  if (options.useFactory) {
    return [{
      provide: PROVIDER_CONFIG,
      useFactory: options.useFactory,
      inject: options.inject || [],
    }];
  }

  if (options.useExisting) {
    return [{
      provide: PROVIDER_CONFIG,
      useFactory: async (factory: IModuleConfigFactory) =>
        await factory.createModuleConfig(),
      inject: [options.useExisting],
    }];
  }

  if (options.useClass) {
    return [{
      provide: PROVIDER_CONFIG,
      useFactory: async (factory: IModuleConfigFactory) =>
        await factory.createModuleConfig(),
      inject: [options.useClass],
    }];
  }

  throw new Error('Invalid async configuration. Must provide useFactory, useExisting or useClass.');
};

export const createConfigProvider = (options: any): any[] => {
  return !options 
    ? [] 
    : [{ provide: PROVIDER_CONFIG, useValue: options }];
}