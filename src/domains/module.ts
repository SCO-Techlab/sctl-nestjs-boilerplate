import { AuthModule } from "@domains/auth";
import { MenuFrontModule } from "@domains/menu-front";
import { PermissionsModule } from "@domains/permissions";
import { ProfileModule } from "@domains/profile";
import { RolesModule } from "@domains/roles";
import { SessionsModule } from "@domains/sessions";
import { UsersModule } from "@domains/users";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    AuthModule.register(),
    SessionsModule,
    PermissionsModule,
    RolesModule,
    UsersModule,
    ProfileModule,
    MenuFrontModule
  ],
})
export class DomainsModule { }
