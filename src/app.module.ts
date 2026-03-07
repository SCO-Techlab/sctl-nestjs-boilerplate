import { AuthModule } from '@domains/auth';
import { PermissionsModule } from '@domains/permissions';
import { ProfileModule } from '@domains/profile';
import { RolesModule } from '@domains/roles';
import { UsersModule } from '@domains/users';
import { PublicMiddleware } from '@middlewares/public.middleware';
import { EmailerModule, IEmailerConfig } from '@modules/emailer';
import { IJwtConfig, JwtModule } from '@modules/jwt';
import { LoggerModule } from '@modules/logger';
import { IMongodbConfig, MongodbModule } from '@modules/mongodb';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_ENV_CONFIG, EMAILER_ENV_CONFIG, JWT_ENV_CONFIG, MONGODB_ENV_CONFIG } from './env-configs';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        APP_ENV_CONFIG,
        MONGODB_ENV_CONFIG,
        JWT_ENV_CONFIG,
        EMAILER_ENV_CONFIG,
      ],
      envFilePath: `./env/${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
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

    AuthModule.register(),
    PermissionsModule,
    RolesModule,
    UsersModule,
    ProfileModule
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(PublicMiddleware).forRoutes('*');
  }
}
