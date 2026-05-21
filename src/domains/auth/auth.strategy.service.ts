import { SessionsRepository, SessionsService } from "@domains/sessions";
import { UsersRepository } from "@domains/users";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { IAuthPayload, ISession, IUser } from "@shared/interfaces";
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy) {

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly sessionsService: SessionsService,
    private readonly sessionsRepository: SessionsRepository,
    private readonly configSerive: ConfigService
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

    const user: IUser = await this.usersRepository.findOne(payload.user.email, 'email') as IUser;
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
      await this.sessionsRepository.updateOne(activeSession._id as string, activeSession);
      throw new UnauthorizedException();
    }

    return user['_doc'];
  }
}
