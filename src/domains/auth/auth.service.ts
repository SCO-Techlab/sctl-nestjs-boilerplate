import { IRole, RolesService } from '@domains/roles';
import { IRefreshSession, RefreshSessionsService, SessionsService } from '@domains/sessions';
import { IUser, UserPasswordUpdateDto, UsersService, UserUpdateDto } from '@domains/users';
import { IJwtToken, JwtService } from '@modules/jwt';
import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MAGIC_NUMBERS } from '@shared/constants';
import { createJwtPayload, createRandomUUID } from '@shared/helpers';
import { BcryptService, EmailTemplatesService } from '@shared/services';
import { AuthLoginDto, AuthRefreshLoginDto, AuthRegisterDto, AuthResetPasswordDto } from './auth.dto';
import { IAuthPayload } from './auth.interface';

@Injectable()
export class AuthService {

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private bcryptService: BcryptService,
    private configSerive: ConfigService,
    private emailTemplatesService: EmailTemplatesService,
    private rolesService: RolesService,
    private sessionsService: SessionsService,
    private refreshSessionsService: RefreshSessionsService
  ) { }

  public async login(login: AuthLoginDto): Promise<IJwtToken> {
    const existUser: IUser = await this.usersService.findOne(login.email, 'email') as IUser;
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

    const accessToken: string = this.jwtService.createToken(createJwtPayload(existUser, createRandomUUID(), false));
    const tokenJti: string = this.jwtService.getJtiFromToken(accessToken);
    if (!tokenJti) {
      throw new UnauthorizedException();
    }

    const refreshToken: string = login.rememberMe
      ? this.jwtService.createRefreshToken(createJwtPayload(existUser, createRandomUUID(), true))
      : '';

    if (refreshToken) {
      const refreshTokenJti: string = this.jwtService.getJtiFromToken(refreshToken, true);
      if (!refreshTokenJti) {
        throw new UnauthorizedException();
      }

      await this.refreshSessionsService.updateUserSession(existUser, refreshTokenJti);
    }

    await this.sessionsService.updateUserSession(existUser, tokenJti);
    return this.jwtService.createTokenResponse(accessToken, refreshToken);
  }

  public async refreshLogin(refreshLogin: AuthRefreshLoginDto): Promise<IJwtToken> {
    const existUser: IUser = await this.usersService.findOne(refreshLogin.email, 'email') as IUser;
    if (!existUser) {
      throw new UnauthorizedException();
    }

    const decodedRefresh: IAuthPayload = this.jwtService.verifyRefreshToken(refreshLogin.token) as IAuthPayload;
    if (!decodedRefresh?.jti || !decodedRefresh.isRefreshToken) {
      throw new UnauthorizedException();
    }

    if (existUser.email !== decodedRefresh?.user?.email) {
      throw new UnauthorizedException();
    }

    const activeRefreshSession: IRefreshSession = await this.refreshSessionsService
      .findActiveUserSessionByJti(existUser._id ?? '', decodedRefresh.jti) as IRefreshSession;

    if (!activeRefreshSession || activeRefreshSession?.isRevoked || activeRefreshSession?.jti !== decodedRefresh.jti) {
      throw new UnauthorizedException();
    }

    if (this.refreshSessionsService.sessionIsExpired(activeRefreshSession)) {
      activeRefreshSession.isRevoked = true;
      activeRefreshSession.revokedAt = new Date();
      await this.refreshSessionsService.updateOne(activeRefreshSession._id as string, activeRefreshSession);
      throw new UnauthorizedException();
    }

    const accessToken: string = this.jwtService.createToken(createJwtPayload(existUser, createRandomUUID(), false));
    const tokenJti: string = this.jwtService.getJtiFromToken(accessToken);
    if (!tokenJti) {
      throw new UnauthorizedException();
    }

    const refreshToken: string = this.jwtService.createRefreshToken(createJwtPayload(existUser, createRandomUUID(), true));
    const refreshTokenJti: string = this.jwtService.getJtiFromToken(refreshToken, true);
    if (!refreshTokenJti) {
      throw new UnauthorizedException();
    }

    await this.sessionsService.updateUserSession(existUser, tokenJti);
    await this.refreshSessionsService.rotateUserSession(existUser, decodedRefresh.jti, refreshTokenJti);
    return this.jwtService.createTokenResponse(accessToken, refreshToken);
  }

  public async logout(user: IUser): Promise<boolean> {
    if (!user?._id) {
      throw new UnauthorizedException();
    }

    const result: number = await this.sessionsService.updateMany(
      { user: user._id, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() }
    );
    return result > MAGIC_NUMBERS.N_0;
  }

  public async register(register: AuthRegisterDto, lang: string): Promise<boolean> {
    const existUser: IUser = await this.usersService.findOne(register.email, 'email') as IUser;
    if (existUser) {
      throw new ConflictException('User with email already exists');
    }

    const existUserName: IUser = await this.usersService.findOne(register.userName, 'userName') as IUser;
    if (existUserName) {
      throw new ConflictException('User with userName already exists');
    }

    const existRole: IRole = await this.rolesService.findOne(register.role, 'name') as IRole;
    if (!existRole) {
      throw new ConflictException('Role not found');
    }

    const createdUser: IUser = await this.usersService.save({ ...register, role: existRole._id as string }) as IUser;
    if (!createdUser) {
      throw new ConflictException('Error creating user');
    }

    if (register.active !== true) {
      const emailSend: boolean = await this.emailTemplatesService.sendWelcomeEmail(createdUser, lang);
      if (!emailSend) {
        throw new ConflictException('Error sending registration email');
      }
    }

    return createdUser !== undefined;
  }

  public async findUser(email: string): Promise<IUser> {
    const existUser: IUser = await this.usersService.findOne(email, 'email') as IUser;
    if (!existUser) {
      throw new NotFoundException(`User with email '${email}' does not exist`);
    }

    return existUser;
  }

  public async confirmUserEmaiil(email: string): Promise<boolean> {
    const existUser: IUser = await this.usersService.findOne(email, 'email') as IUser;
    if (!existUser) {
      throw new NotFoundException(`User with email '${email}' does not exist`);
    }

    if (existUser.emailConfirmed) {
      throw new ConflictException('User email is already confirmed');
    }

    const userUpdateDto: UserUpdateDto = {
      emailConfirmed: true,
      emailConfirmedAt: new Date(),
      active: true
    };

    const updatedUser: IUser = await this.usersService.updateOne(existUser._id as string, userUpdateDto);
    if (!updatedUser) {
      throw new ConflictException('Error confirming user email');
    }

    return true;
  }

  public async forgotPassword(email: string, lang: string): Promise<boolean> {
    const existUser: IUser = await this.usersService.findOne(email, 'email') as IUser;
    if (!existUser) {
      throw new NotFoundException('User not found');
    }

    existUser.pwdRecoveryToken = this.bcryptService.randomToken();
    existUser.pwdRecoveryDate = new Date();

    const userUpdateDto: UserUpdateDto = {
      pwdRecoveryToken: existUser.pwdRecoveryToken,
      pwdRecoveryDate: existUser.pwdRecoveryDate,
    };

    const updatedUser: IUser = await this.usersService.updateOne(existUser._id as string, userUpdateDto);
    if (!updatedUser) {
      throw new ConflictException('Error updating user');
    }

    const emailSend: boolean = await this.emailTemplatesService.sendForgotPasswordEmail(updatedUser, lang);
    if (!emailSend) {
      throw new ConflictException('Error sending password recovery email');
    }

    return true;
  }

  public async recoverPasswordFind(pwdRecoveryToken: string): Promise<IUser> {
    const existUser: IUser = await this.usersService.findOne(pwdRecoveryToken, 'pwdRecoveryToken') as IUser;
    if (!existUser) {
      throw new UnauthorizedException();
    }

    const minutes: number = this.configSerive.get('app').pwdRecoveryExpiration ?? MAGIC_NUMBERS.N_30;
    const expirationTime = minutes * MAGIC_NUMBERS.N_60 * MAGIC_NUMBERS.N_1000;
    if (existUser.pwdRecoveryDate && (Date.now() - existUser.pwdRecoveryDate.getTime()) > expirationTime) {
      throw new UnauthorizedException('Password recovery token is expired');
    }

    return existUser;
  }

  public async recoverPasswordReset(passwordResetDto: AuthResetPasswordDto): Promise<boolean> {
    const existUser: IUser = await this.usersService.findOne(passwordResetDto.userId, '_id') as IUser;
    if (!existUser) {
      throw new UnauthorizedException();
    }

    const userUpdatePasswordDto: UserPasswordUpdateDto = {
      password: passwordResetDto.password,
      newPassword: passwordResetDto.password,
    };

    const updatedPassword = await this.usersService.updatePassword(existUser._id as string, userUpdatePasswordDto, false);
    if (!updatedPassword) {
      throw new ConflictException('Error updating user password');
    }

    const userUpdateDto: UserUpdateDto = {
      pwdRecoveryToken: null,
      pwdRecoveryDate: null,
    };
    const updatedUser: IUser = await this.usersService.updateOne(existUser._id as string, userUpdateDto);
    if (!updatedUser) {
      throw new ConflictException('Error updating user');
    }

    return true;
  }
}
