import { UsersModule } from "@domains/users";
import { JWT_TOKEN_TYPE } from "@modules/jwt";
import { DynamicModule, Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

const MODULE = {
  imports: [
    PassportModule.register({ defaultStrategy: JWT_TOKEN_TYPE.JWT }),
    UsersModule
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