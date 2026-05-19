import { IJwtToken, JwtService } from '@core/jwt';
import { IRole, RolesService } from '@domains/roles';
import { ISession, SessionsService } from '@domains/sessions';
import { IUser, UserPasswordUpdateDto, UsersService, UserUpdateDto } from '@domains/users';
import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MAGIC_NUMBERS } from '@shared/constants';
import { createJwtPayload, createRandomUUID } from '@shared/helpers';
import { BcryptService, SendTemplatesService } from '@shared/services';
import { AuthLoginDto, AuthRefreshLoginDto, AuthRegisterDto, AuthResetPasswordDto } from './auth.dto';
import { IAuthPayload } from './auth.interface';

@Injectable()
export class AuthService {

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private bcryptService: BcryptService,
    private configSerive: ConfigService,
    private sendTemplatesService: SendTemplatesService,
    private rolesService: RolesService,
    private sessionsService: SessionsService,
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

    const accessJti: string = createRandomUUID();
    const accessToken: string = this.jwtService.createToken(createJwtPayload(existUser, accessJti, false));
    const tokenJti: string = this.jwtService.getJtiFromToken(accessToken);
    if (!tokenJti) {
      throw new UnauthorizedException();
    }

    let refreshToken = '';
    let refreshTokenJti = '';
    if (login.rememberMe) {
      refreshTokenJti = createRandomUUID();
      refreshToken = this.jwtService.createRefreshToken(createJwtPayload(existUser, refreshTokenJti, true));
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

    const existUser: IUser = await this.usersService.findOne(decodedRefresh.user.email, 'email') as IUser;
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
      await this.sessionsService.updateOne(activeSession._id as string, activeSession);
      throw new UnauthorizedException();
    }

    const accessJti: string = createRandomUUID();
    const accessToken: string = this.jwtService.createToken(createJwtPayload(existUser, accessJti, false));
    const tokenJti: string = this.jwtService.getJtiFromToken(accessToken);
    if (!tokenJti) {
      throw new UnauthorizedException();
    }

    const refreshTokenJti: string = createRandomUUID();
    const refreshToken: string = this.jwtService.createRefreshToken(createJwtPayload(existUser, refreshTokenJti, true));
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

    const result: number = await this.sessionsService.updateMany(
      { user: user._id, isRevoked: false, isAccessRevoked: false },
      { isAccessRevoked: true, revokedAt: new Date() }
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
      const emailSend: boolean = await this.sendTemplatesService.sendWelcomeEmail(createdUser, lang);
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

    const emailSend: boolean = await this.sendTemplatesService.sendForgotPasswordEmail(updatedUser, lang);
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
