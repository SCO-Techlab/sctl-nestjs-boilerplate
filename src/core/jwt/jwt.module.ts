import { createAsyncConfigProvider, createConfigProvider } from '@core/shared/helpers';
import { IJwtConfig, IModuleAsyncConfig } from '@core/shared/interfaces';
import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule as NestjsJwtModule } from '@nestjs/jwt';
import { JwtService } from './jwt.service';

@Module({})
export class JwtModule {
  static register(options: IJwtConfig): DynamicModule {
    return {
      module: JwtModule,
      imports: [
        NestjsJwtModule.register({
          secret: options.secret,
          signOptions: {
            algorithm: options.algorithm as any,
            expiresIn: options.signOptions.expiresIn as any,
            issuer: options.signOptions.issuer,
            audience: options.signOptions.audience,
          }
        }),
      ],
      providers: [
        ...createConfigProvider(options),
        JwtService
      ],
      exports: [
        JwtService
      ],
      global: true,
    };
  }

  public static registerAsync(options: IModuleAsyncConfig): DynamicModule {
    return {
      module: JwtModule,
      imports: [
        NestjsJwtModule.registerAsync({
          useFactory: options.useFactory,
          inject: options.inject || [],
        }),
      ],
      providers: [
        ...createAsyncConfigProvider(options),
        JwtService
      ],
      exports: [
        JwtService
      ],
      global: true,
    };
  }
}