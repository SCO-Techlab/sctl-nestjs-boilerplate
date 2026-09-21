import { IJwtToken, JwtService } from '@core/jwt';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { RolesRepository } from '@domains/roles';
import { SessionsRepository, SessionsService } from '@domains/sessions';
import { TenantsService } from '@domains/tenants';
import { UsersRepository, UsersService } from '@domains/users';
import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createJwtPayload, createRandomUUID } from '@shared/helpers';
import { IAuthPayload, IRole, ISession, ITenant, IUser } from '@shared/interfaces';
import { BcryptService, TemplatesService } from '@shared/services';
import { AuthLoginDto, AuthRefreshLoginDto, AuthRegisterDto, AuthResetPasswordDto } from './auth.dto';

@Injectable()
export class AuthService {

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
    private readonly bcryptService: BcryptService,
    private readonly configService: ConfigService,
    private readonly rolesRepository: RolesRepository,
    private readonly sessionsService: SessionsService,
    private readonly sessionsRepository: SessionsRepository,
    private readonly templatesService: TemplatesService,
    private readonly tenantsService: TenantsService
  ) { }

  public async login(login: AuthLoginDto): Promise<IJwtToken> {
    const existUser: IUser = await this.usersRepository.findOne(login.email, 'email') as IUser;
    if (!existUser) {
      throw new UnauthorizedException();
    }

    const passwordsMatch: boolean = await this.bcryptService.compare(login.password, existUser.password);
    if (!passwordsMatch) {
      throw new UnauthorizedException();
    }

    if (!existUser.active) {
      throw new ForbiddenException('User is not active');
    }

    const accessJti: string = createRandomUUID();
    const tenants: ITenant[] = await this.getPayloadTenants(existUser._id as string);
    const payload: IAuthPayload = createJwtPayload(existUser, tenants, accessJti, false);
    const accessToken: string = this.jwtService.createToken(payload);
    const tokenJti: string = this.jwtService.getJtiFromToken(accessToken);
    if (!tokenJti) {
      throw new UnauthorizedException();
    }

    let refreshToken = '';
    let refreshTokenJti = '';
    if (login.rememberMe) {
      refreshTokenJti = createRandomUUID();
      const payloadRefreshToken: IAuthPayload = createJwtPayload(existUser, tenants, refreshTokenJti, true);
      refreshToken = this.jwtService.createRefreshToken(payloadRefreshToken);
      if (!refreshToken) {
        throw new UnauthorizedException();
      }
    }

    await this.sessionsService.updateUserSession(existUser, tokenJti, refreshTokenJti || undefined);
    return this.jwtService.createTokenResponse(accessToken, refreshToken);
  }

  public async refreshLogin(refreshLogin: AuthRefreshLoginDto): Promise<IJwtToken> {
    const decodedRefresh: IAuthPayload = this.jwtService.verifyRefreshToken(refreshLogin.token) as IAuthPayload;
    if (!decodedRefresh?.jti || !decodedRefresh.isRefreshToken) {
      throw new UnauthorizedException();
    }

    const existUser: IUser = await this.usersRepository.findOne(decodedRefresh.user.email, 'email') as IUser;
    if (!existUser) {
      throw new UnauthorizedException();
    }

    const activeSession: ISession = await this.sessionsService
      .findActiveSessionByRefreshJti(existUser._id ?? '', decodedRefresh.jti) as ISession;

    if (!activeSession || activeSession?.isRevoked || activeSession?.refreshJti !== decodedRefresh.jti) {
      throw new UnauthorizedException();
    }

    if (this.sessionsService.refreshSessionIsExpired(activeSession)) {
      activeSession.isRevoked = true;
      activeSession.revokedAt = new Date();
      await this.sessionsRepository.updateOne(activeSession._id as string, activeSession);
      throw new UnauthorizedException();
    }

    const accessJti: string = createRandomUUID();
    const tenants: ITenant[] = await this.getPayloadTenants(existUser._id as string);
    const payload: IAuthPayload = createJwtPayload(existUser, tenants, accessJti, false);
    const accessToken: string = this.jwtService.createToken(payload);
    const tokenJti: string = this.jwtService.getJtiFromToken(accessToken);
    if (!tokenJti) {
      throw new UnauthorizedException();
    }

    const refreshTokenJti: string = createRandomUUID();
    const payloadRefreshToken: IAuthPayload = createJwtPayload(existUser, tenants, refreshTokenJti, true);
    const refreshToken: string = this.jwtService.createRefreshToken(payloadRefreshToken);
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    await this.sessionsService.rotateSession(activeSession._id as string, tokenJti, refreshTokenJti);
    return this.jwtService.createTokenResponse(accessToken, refreshToken);
  }

  public async logout(user: IUser): Promise<boolean> {
    if (!user?._id) {
      throw new UnauthorizedException();
    }

    const result: number = await this.sessionsRepository.updateMany(
      { user: user._id, isRevoked: false, isAccessRevoked: false },
      { isAccessRevoked: true, revokedAt: new Date() }
    );
    return result > MAGIC_NUMBERS.N_0;
  }

  public async register(register: AuthRegisterDto, lang: string): Promise<boolean> {
    const existUser: IUser = await this.usersRepository.findOne(register.email, 'email') as IUser;
    if (existUser) {
      throw new ConflictException('User with email already exists');
    }

    const existUserName: IUser = await this.usersRepository.findOne(register.userName, 'userName') as IUser;
    if (existUserName) {
      throw new ConflictException('User with userName already exists');
    }

    const existRole: IRole = await this.rolesRepository.findOne(register.role, 'name') as IRole;
    if (!existRole) {
      throw new ConflictException('Role not found');
    }

    const createdUser: IUser = await this.usersRepository.save({ ...register, role: existRole }) as IUser;
    if (!createdUser) {
      throw new ConflictException('Error creating user');
    }

    if (register.active !== true) {
      const emailSend: boolean = await this.templatesService.sendWelcomeEmail(createdUser, lang);
      if (!emailSend) {
        throw new ConflictException('Error sending registration email');
      }
    }

    return createdUser !== undefined;
  }

  public async findUser(email: string): Promise<IUser> {
    const existUser: IUser = await this.usersRepository.findOne(email, 'email') as IUser;
    if (!existUser) {
      throw new NotFoundException(`User with email '${email}' does not exist`);
    }

    return existUser;
  }

  public async confirmUserEmaiil(email: string): Promise<boolean> {
    const existUser: IUser = await this.usersRepository.findOne(email, 'email') as IUser;
    if (!existUser) {
      throw new NotFoundException(`User with email '${email}' does not exist`);
    }

    if (existUser.emailConfirmed) {
      throw new ConflictException('User email is already confirmed');
    }

    const userUpdateDto: any = {
      ...existUser,
      emailConfirmed: true,
      emailConfirmedAt: new Date(),
      active: true
    };

    const updatedUser: IUser = await this.usersRepository.updateOne(existUser._id as string, userUpdateDto);
    if (!updatedUser) {
      throw new ConflictException('Error confirming user email');
    }

    return true;
  }

  public async forgotPassword(email: string, lang: string): Promise<boolean> {
    const existUser: IUser = await this.usersRepository.findOne(email, 'email') as IUser;
    if (!existUser) {
      throw new NotFoundException('User not found');
    }

    existUser.pwdRecoveryToken = this.bcryptService.randomToken();
    existUser.pwdRecoveryDate = new Date();

    const userUpdateDto: any = {
      ...existUser,
      pwdRecoveryToken: existUser.pwdRecoveryToken,
      pwdRecoveryDate: existUser.pwdRecoveryDate,
    };

    const updatedUser: IUser = await this.usersRepository.updateOne(existUser._id as string, userUpdateDto);
    if (!updatedUser) {
      throw new ConflictException('Error updating user');
    }

    const emailSend: boolean = await this.templatesService.sendForgotPasswordEmail(updatedUser, lang);
    if (!emailSend) {
      throw new ConflictException('Error sending password recovery email');
    }

    return true;
  }

  public async recoverPasswordFind(pwdRecoveryToken: string): Promise<IUser> {
    const existUser: IUser = await this.usersRepository.findOne(pwdRecoveryToken, 'pwdRecoveryToken') as IUser;
    if (!existUser) {
      throw new UnauthorizedException();
    }

    const minutes: number = this.configService.get('app').pwdRecoveryExpiration ?? MAGIC_NUMBERS.N_30;
    const expirationTime = minutes * MAGIC_NUMBERS.N_60 * MAGIC_NUMBERS.N_1000;
    if (existUser.pwdRecoveryDate && (Date.now() - existUser.pwdRecoveryDate.getTime()) > expirationTime) {
      throw new UnauthorizedException('Password recovery token is expired');
    }

    return existUser;
  }

  public async recoverPasswordReset(passwordResetDto: AuthResetPasswordDto): Promise<boolean> {
    const existUser: IUser = await this.usersRepository.findOne(passwordResetDto.userId, '_id') as IUser;
    if (!existUser) {
      throw new UnauthorizedException();
    }

    const updatedPassword = await this.usersService.updatePassword(existUser._id as string, passwordResetDto.password, passwordResetDto.password, false);
    if (!updatedPassword) {
      throw new ConflictException('Error updating user password');
    }

    const userUpdateDto: any = {
      ...existUser,
      pwdRecoveryToken: null,
      pwdRecoveryDate: null,
    };
    const updatedUser: IUser = await this.usersRepository.updateOne(existUser._id as string, userUpdateDto);
    if (!updatedUser) {
      throw new ConflictException('Error updating user');
    }

    return true;
  }

  private async getPayloadTenants(_id: string) {
    const tenants: ITenant[] = this.configService.get('app').multitenancyEnabled
      ? await this.tenantsService.getUserTenants(_id as string)
      : [];

    return tenants;
  }
}
