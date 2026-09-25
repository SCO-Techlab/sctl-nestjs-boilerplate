import { AuthModule } from "@domains/auth";
import { MenuFrontModule } from "@domains/menu-front";
import { PermissionsModule } from "@domains/permissions";
import { ProfileModule } from "@domains/profile";
import { ResidencesModule } from "@domains/residences";
import { RolesModule } from "@domains/roles";
import { RoomsModule } from "@domains/rooms";
import { SessionsModule } from "@domains/sessions";
import { TenantsModule } from '@domains/tenants';
import { UsersModule } from "@domains/users";
import { Module } from "@nestjs/common";
import { ImagesModule } from "./images/images.module";

@Module({
  imports: [
    AuthModule.register(),
    SessionsModule,
    PermissionsModule,
    RolesModule,
    UsersModule,
    ProfileModule,
    MenuFrontModule,
    TenantsModule,
    ResidencesModule,
    RoomsModule,
    ImagesModule,
  ],
})
export class DomainsModule { }
