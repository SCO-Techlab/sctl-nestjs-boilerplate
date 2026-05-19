import { EmailerModule, IEmailerConfig } from "@core/emailer";
import { GRIDFS_BUCKETS, GridfsModule } from "@core/gridfs";
import { IJwtConfig, JwtModule } from "@core/jwt";
import { LoggerModule } from "@core/logger";
import { IMongodbConfig, MongodbModule } from "@core/mongodb";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

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
