
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EmailerModule } from "./emailer";
import { GridfsModule } from "./gridfs";
import { JwtModule } from "./jwt";
import { LoggerModule } from "./logger";
import { MongodbModule } from "./mongodb";
import { IEmailerConfig, IJwtConfig, IMongodbConfig } from "./shared";


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
        { name: GRIDFS_BUCKETS.AVATARS, indexes: [{ filename: false, metadata: ['email'] }] }
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
  ]
})
export class CoreModule { }
