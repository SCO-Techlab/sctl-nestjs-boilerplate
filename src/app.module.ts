import { AuthModule } from '@domains/auth';
import { MenuFrontModule } from '@domains/menu-front';
import { PermissionsModule } from '@domains/permissions';
import { ProfileModule } from '@domains/profile';
import { RolesModule } from '@domains/roles';
import { SessionsModule } from '@domains/sessions';
import { UsersModule } from '@domains/users';
import { EmailerModule, IEmailerConfig } from '@modules/emailer';
import { GridfsModule } from '@modules/gridfs';
import { IJwtConfig, JwtModule } from '@modules/jwt';
import { LoggerModule } from '@modules/logger';
import { IMongodbConfig, MongodbModule } from '@modules/mongodb';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GRIDFS_BUCKETS } from '@shared/constants';
import { APP_ENV_CONFIG, EMAILER_ENV_CONFIG, JWT_ENV_CONFIG, MONGODB_ENV_CONFIG } from './env-configs';
import { PublicMiddleware } from './middlewares';

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

    AuthModule.register(),
    SessionsModule,
    PermissionsModule,
    RolesModule,
    UsersModule,
    ProfileModule,
    MenuFrontModule
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(PublicMiddleware).forRoutes('*');
  }
}
