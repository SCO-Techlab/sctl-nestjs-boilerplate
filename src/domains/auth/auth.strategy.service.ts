import { IUser, UsersService } from "@domains/users";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IAuthPayload } from "./auth.interface";
import { IToken, TokensService } from "./tokens";

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy) {

  constructor(
    private usersService: UsersService,
    private tokensService: TokensService,
    private configSerive: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configSerive.get('jwt').secret,
    });
  }

  async validate(payload: IAuthPayload): Promise<IUser> {
    const user: IUser = await this.usersService.findOne(payload.user.email, 'email') as IUser;
    if (!user || !user.active) {
      throw new UnauthorizedException();
    }

    const activeToken: IToken = await this.tokensService.findLatestActiveByUser(user._id as string) as IToken;
    if (!activeToken) {
      throw new UnauthorizedException();
    }

    if (activeToken.jti !== payload.jti) {
      throw new UnauthorizedException();
    }

    return user['_doc'];
  }
}
