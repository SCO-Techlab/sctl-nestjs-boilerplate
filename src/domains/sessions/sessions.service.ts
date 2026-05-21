import { LoggerService } from "@core/logger";
import { formatMongodbError } from "@core/mongodb";
import { MAGIC_NUMBERS } from "@core/shared/constants";
import { IJwtConfig } from "@core/shared/interfaces";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { parseDateUnits } from "@shared/helpers";
import { ISession, IUser } from "@shared/interfaces";
import { SortOrder } from "mongoose";
import { SessionsRepository } from "./sessions.repository";

@Injectable()
export class SessionsService {

  constructor(
    private readonly loggerService: LoggerService,
    private readonly configService: ConfigService,
    private readonly repository: SessionsRepository,
  ) { }

  async revoke(_id: string): Promise<ISession> {
    const value: ISession = await this.repository.findOne(_id) as ISession;
    if (!value) {
      throw new NotFoundException(`Session with id ${_id} not found`);
    }

    value.isRevoked = true;
    value.revokedAt = new Date();
    const updatedValue: ISession = await this.repository.updateOne(_id, value);
    if (!updatedValue) {
      throw new NotFoundException(`Session with id ${_id} not found for revocation`);
    }

    return updatedValue;
  }

  async findLastActiveUserSession(userId: string): Promise<ISession | undefined> {
    try {
      return await this.repository.Model
        .findOne({ user: userId, isRevoked: false })
        .sort({ createdAt: MAGIC_NUMBERS.N_MINUS_1 as SortOrder })
        .exec() ?? undefined;
    } catch (error) {
      throw formatMongodbError(error, 'SessionsService', 'findLastActiveUserSession', this.loggerService);
    }
  }

  async findActiveSessionByRefreshJti(userId: string, refreshJti: string): Promise<ISession | undefined> {
    try {
      return await this.repository.Model
        .findOne({ user: userId, refreshJti, isRevoked: false, isRefreshRevoked: false })
        .exec() ?? undefined;
    } catch (error) {
      throw formatMongodbError(error, 'SessionsService', 'findActiveSessionByRefreshJti', this.loggerService);
    }
  }

  async findActiveSessionByAccessJti(userId: string, accessJti: string): Promise<ISession | undefined> {
    try {
      return await this.repository.Model
        .findOne({ user: userId, accessJti, isRevoked: false, isAccessRevoked: false })
        .exec() ?? undefined;
    } catch (error) {
      throw formatMongodbError(error, 'SessionsService', 'findActiveSessionByAccessJti', this.loggerService);
    }
  }

  async updateUserSession(user: IUser, accessJti: string, refreshJti?: string): Promise<void> {
    const jwtConfig: IJwtConfig = this.configService.get('jwt') as IJwtConfig;

    await this.repository.updateMany(
      { user: user._id, isRevoked: false },
      {
        isRevoked: true,
        isAccessRevoked: true,
        isRefreshRevoked: true,
        revokedAt: new Date()
      }
    );

    const accessExpiresAt: Date = new Date(Date.now() + parseDateUnits(jwtConfig?.signOptions?.expiresIn));
    const refreshExpiresAt: Date | undefined = refreshJti
      ? new Date(Date.now() + parseDateUnits(jwtConfig?.refresh?.expiresIn as string))
      : undefined;

    await this.repository.save({
      user,
      accessJti,
      accessExpiresAt,
      refreshJti,
      refreshExpiresAt,
      isRevoked: false,
      isAccessRevoked: false,
      isRefreshRevoked: false,
      revokedAt: undefined
    });
  }

  async rotateSession(_id: string, accessJti: string, refreshJti: string): Promise<ISession> {
    const session: ISession = await this.repository.findOne(_id) as ISession;
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const jwtConfig: IJwtConfig = this.configService.get('jwt') as IJwtConfig;
    session.accessJti = accessJti;
    session.accessExpiresAt = new Date(Date.now() + parseDateUnits(jwtConfig?.signOptions?.expiresIn));
    session.refreshJti = refreshJti;
    session.refreshExpiresAt = new Date(Date.now() + parseDateUnits(jwtConfig?.refresh?.expiresIn as string));
    session.isAccessRevoked = false;
    session.isRefreshRevoked = false;

    return await this.repository.updateOne(_id, session);
  }

  sessionIsExpired(session: ISession): boolean {
    return session.accessExpiresAt < new Date();
  }

  refreshSessionIsExpired(session: ISession): boolean {
    return !session.refreshExpiresAt || session.refreshExpiresAt < new Date();
  }
}
