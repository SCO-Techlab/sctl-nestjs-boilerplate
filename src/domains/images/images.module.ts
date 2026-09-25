import { JWT_TOKEN_TYPE } from "@core/jwt";
import { ResidencesModule } from "@domains/residences";
import { RoomsModule } from "@domains/rooms";
import { TenantsModule } from "@domains/tenants";
import { UsersModule } from "@domains/users";
import { DynamicModule, Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { ImagesController } from "./images.controller";
import { ImagesService } from "./images.service";

const MODULE = {
  imports: [
    PassportModule.register({ defaultStrategy: JWT_TOKEN_TYPE.JWT }),
    TenantsModule,
    UsersModule,
    ResidencesModule,
    RoomsModule,
  ],
  controllers: [
    ImagesController
  ],
  providers: [
    ImagesService
  ],
  exports: [
    ImagesService
  ]
};

@Module({ ...MODULE })
export class ImagesModule {
  static register(): DynamicModule {
    return {
      module: ImagesModule,
      ...MODULE,
      global: true
    };
  }
}
