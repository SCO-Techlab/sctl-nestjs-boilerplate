import { APP_ENV, EMAILER_ENV, JWT_ENV, MONGODB_ENV } from '@core/env';
import { PublicMiddleware } from '@core/middlewares';
import { CoreModule } from '@core/modules';
import { AuthModule } from '@domains/auth';
import { MenuFrontModule } from '@domains/menu-front';
import { PermissionsModule } from '@domains/permissions';
import { ProfileModule } from '@domains/profile';
import { RolesModule } from '@domains/roles';
import { SessionsModule } from '@domains/sessions';
import { UsersModule } from '@domains/users';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        APP_ENV,
        MONGODB_ENV,
        JWT_ENV,
        EMAILER_ENV,
      ],
      envFilePath: `./env/${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    CoreModule,

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
