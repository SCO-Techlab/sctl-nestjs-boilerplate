import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EmailerModule, IEmailerConfig } from "./emailer";
import { BUCKETS, GridfsModule } from "./gridfs";
import { IJwtConfig, JwtModule } from "./jwt";
import { LoggerModule } from "./logger";
import { IMongodbConfig, MongodbModule } from "./mongodb";
import { PaginationModule } from "./pagination";

@Module({
  imports: [
    LoggerModule.register(),
    MongodbModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return [
          configService.get('mongodb') as IMongodbConfig
        ];
      },
      inject: [ConfigService],
    }),
    GridfsModule.register({
      buckets: [
        { name: BUCKETS.AVATARS, indexes: [{ filename: false, metadata: ['email'] }] },
        { name: BUCKETS.TENANTS_AVATARS, indexes: [{ filename: false, metadata: ['tenantId'] }] }
      ]
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return configService.get('jwt') as IJwtConfig;
      },
      inject: [ConfigService],
    }),
    EmailerModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return [
          configService.get('emailer') as IEmailerConfig
        ]
      },
      inject: [ConfigService],
    }),
    PaginationModule.register(),
  ]
})
export class CoreModule { }
