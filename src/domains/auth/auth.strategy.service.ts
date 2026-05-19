import { ISession, SessionsService } from "@domains/sessions";
import { IUser, UsersService } from "@domains/users";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IAuthPayload } from "./auth.interface";

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy) {

  constructor(
    private usersService: UsersService,
    private sessionsService: SessionsService,
    private configSerive: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configSerive.get('jwt').secret,
    });
  }

  async validate(payload: IAuthPayload): Promise<IUser> {
    if (payload.isRefreshToken) {
      throw new UnauthorizedException();
    }

    const user: IUser = await this.usersService.findOne(payload.user.email, 'email') as IUser;
    if (!user || !user.active) {
      throw new UnauthorizedException();
    }

    const activeSession: ISession = await this.sessionsService.findActiveSessionByAccessJti(user._id as string, payload?.jti) as ISession;
    if (!activeSession || activeSession?.isRevoked || activeSession?.accessJti !== payload?.jti) {
      throw new UnauthorizedException();
    }

    if (this.sessionsService.sessionIsExpired(activeSession)) {
      activeSession.isRevoked = true;
      activeSession.revokedAt = new Date();
      await this.sessionsService.updateOne(activeSession._id as string, activeSession);
      throw new UnauthorizedException();
    }

    return user['_doc'];
  }
}
