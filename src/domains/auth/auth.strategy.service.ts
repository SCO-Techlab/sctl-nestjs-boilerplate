import { IUser, UsersService } from "@domains/users";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { MAGIC_STRINGS } from "@shared/constants";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IAuthPayload } from "./auth.interface";

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy) {

  constructor(
    private usersService: UsersService,
    private configSerive: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configSerive.get('jwt').secret,
    });
  }

  async validate(payload: IAuthPayload): Promise<IUser> {
    const user: IUser = await this.usersService.findOne(payload.user.email, MAGIC_STRINGS.EMAIL) as IUser;
    if (!user || !user.active) {
      throw new UnauthorizedException(MAGIC_STRINGS.UNAUTHORIZED);
    }
    return user;
  }
}
