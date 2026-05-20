import { ModuleMetadata, Type } from "@nestjs/common";

export interface IModuleConfigFactory {
  createModuleConfig(): Promise<any> | any;
}

export interface IModuleAsyncConfig
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useExisting?: Type<IModuleConfigFactory>;
  useClass?: Type<IModuleConfigFactory>;
  useFactory?: (...args: any[]) => Promise<any> | any;
}