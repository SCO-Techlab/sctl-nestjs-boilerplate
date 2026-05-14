import { MenuFrontModule } from "@domains/menu-front";
import { SessionsModule } from "@domains/sessions";
import { UsersModule } from "@domains/users";
import { JWT_TOKEN_TYPE } from "@modules/jwt";
import { DynamicModule, Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

const MODULE = {
  imports: [
    PassportModule.register({ defaultStrategy: JWT_TOKEN_TYPE.JWT }),
    UsersModule,
    SessionsModule,
    MenuFrontModule
  ],
  controllers: [
    ProfileController
  ],
  providers: [
    ProfileService
  ],
  exports: [
    ProfileService
  ]
};

@Module({ ...MODULE })
export class ProfileModule {
  static register(): DynamicModule {
    return {
      module: ProfileModule,
      ...MODULE,
      global: true
    };
  }
}