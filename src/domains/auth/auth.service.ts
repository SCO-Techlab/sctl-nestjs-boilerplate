import { IRole, RolesService } from '@domains/roles';
import { IUser, UserPasswordUpdateDto, UsersService, UserUpdateDto } from '@domains/users';
import { EmailerService } from '@modules/emailer';
import { IJwtToken, JwtService } from '@modules/jwt';
import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MAGIC_NUMBERS, TEMPLATES, TRANSLATES } from '@shared/constants';
import { getFrontendUrl, parseDateUnits } from '@shared/helpers';
import { BcryptService } from '@shared/services';
import { AuthLoginDto, AuthRegisterDto, AuthResetPasswordDto, AuthTokenValidationDto } from './auth.dto';
import { IAuthPayload } from './auth.interface';
import { IRefreshToken, RefreshTokenService } from './refresh-tokens';

@Injectable()
export class AuthService {

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private bcryptService: BcryptService,
    private configSerive: ConfigService,
    private emailerService: EmailerService,
    private rolesService: RolesService,
    private refreshTokenService: RefreshTokenService
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

    const payload: IAuthPayload = {
      _id: existUser._id as string,
      user: {
        _id: existUser._id as string,
        email: existUser.email,
        password: '',
        userName: existUser.userName,
        personalName: existUser.personalName,
        active: existUser.active,
        emailConfirmed: existUser.emailConfirmed,
        role: existUser.role,
        pwdRecoveryToken: existUser.pwdRecoveryToken,
        pwdRecoveryDate: existUser.pwdRecoveryDate,
        extension: existUser.extension,
      }
    };

    const token: IJwtToken = this.jwtService.createToken(payload) as IJwtToken;
    if (!token) {
      throw new UnauthorizedException();
    }

    if (token.refreshToken) {
      await this.refreshTokenService.updateMany({ user: existUser._id, isRevoked: false }, { isRevoked: true, revokedAt: new Date() });
      await this.refreshTokenService.save({ 
        user: existUser as IUser, 
        tokenHash: token.refreshToken, 
        expiresAt: new Date(Date.now() + parseDateUnits(this.configSerive.get('jwt').refresh.expiresIn)),
        isRevoked: false,
        revokedAt: undefined
      });
    }

    return token;
  }

  public async tokenValidation(authTokenValidationDto: AuthTokenValidationDto): Promise<IJwtToken> {
    const existUser: IUser = await this.usersService.findOne(authTokenValidationDto?.email, 'email') as IUser;
    if (!existUser) {
      throw new UnauthorizedException();
    }

    const verifyToken: IAuthPayload = !authTokenValidationDto?.isAccessToken
      ? await this.jwtService.verifyRefreshToken(authTokenValidationDto?.token) as IAuthPayload
      : await this.jwtService.verifyToken(authTokenValidationDto?.token) as IAuthPayload;

    if (verifyToken?.user?.email !== existUser.email) {
      throw new UnauthorizedException();
    }

    const payload: IAuthPayload = {
      _id: existUser._id as string,
      user: {
        _id: existUser._id as string,
        email: existUser.email,
        password: '',
        userName: existUser.userName,
        personalName: existUser.personalName,
        active: existUser.active,
        emailConfirmed: existUser.emailConfirmed,
        role: existUser.role,
        pwdRecoveryToken: existUser.pwdRecoveryToken,
        pwdRecoveryDate: existUser.pwdRecoveryDate,
        extension: existUser.extension,
      }
    };

    const token: IJwtToken = this.jwtService.createToken(payload) as IJwtToken;
    if (!token) {
      throw new UnauthorizedException();
    }

    const refreshToken: IRefreshToken = (await this.refreshTokenService.find({ user: existUser, isRevoked: false }) as IRefreshToken[])?.[MAGIC_NUMBERS.N_0];
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    
    const tokensAreaEquals: boolean = await this.bcryptService.compare(authTokenValidationDto.token, refreshToken?.tokenHash);
    if (!tokensAreaEquals) {
      throw new UnauthorizedException();
    }

    const tokenIsExpired: boolean = Date.now() > refreshToken.expiresAt.getTime();
    if (tokenIsExpired) {
      throw new UnauthorizedException();
    }

    if (token.refreshToken) {
      await this.refreshTokenService.updateMany({ user: existUser._id, isRevoked: false }, { isRevoked: true, revokedAt: new Date() });
      await this.refreshTokenService.save({ 
        user: existUser as IUser, 
        tokenHash: token.refreshToken, 
        expiresAt: new Date(Date.now() + parseDateUnits(this.configSerive.get('jwt').refresh.expiresIn)),
        isRevoked: false,
        revokedAt: undefined
      });
    }

    return token;
  }

  public async register(register: AuthRegisterDto, lang: string): Promise<boolean> {
    const existUser: IUser = await this.usersService.findOne(register.email, 'email') as IUser;
    if (existUser) {
      throw new ConflictException('User with email already exists');
    }

    const existRole: IRole = await this.rolesService.findOne(register.role, 'name') as IRole;
    if (!existRole) {
      throw new ConflictException('Role not found');
    }

    const createdUser: IUser = await this.usersService.save({ ...register, role: existRole._id as string });
    if (!createdUser) {
      throw new ConflictException('Error creating user');
    }

    if (register.active !== true) {
      const emailSend: boolean = await this.emailerService.sendTemplate({
        template: TEMPLATES.WELCOME,
        context: {
          welcome: {
            params: {
              name: register.userName,
              link: getFrontendUrl(
                this.configSerive.get('app').httpsEnabled,
                this.configSerive.get('app').host,
                this.configSerive.get('app').production ? this.configSerive.get('app').port : MAGIC_NUMBERS.N_4200,
                `auth/confirm-email/${register.email}`
              )
            },
            literals: {
              welcomeText: TRANSLATES[lang].welcome.welcomeText,
              message: TRANSLATES[lang].welcome.message,
              linkText: TRANSLATES[lang].welcome.linkText
            }
          },
          footer: {
            params: {
              year: new Date().getFullYear(),
              appName: this.configSerive.get('app').appName
            }
          }
        },
        receivers: [register.email],
        subject: TRANSLATES[lang].welcome.subject
      });
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

    const emailSend: boolean = await this.emailerService.sendTemplate({
      template: TEMPLATES.FORGOT_PASSWORD,
      context: {
        forgotPassword: {
          params: {
            name: existUser.userName,
            link: getFrontendUrl(
              this.configSerive.get('app').httpsEnabled,
              this.configSerive.get('app').host,
              this.configSerive.get('app').production ? this.configSerive.get('app').port : MAGIC_NUMBERS.N_4200,
              `auth/reset-password/${existUser.pwdRecoveryToken}`
            ),
            expiration: this.configSerive.get('app').pwdRecoveryExpiration ?? MAGIC_NUMBERS.N_30
          },
          literals: {
            welcomeText: TRANSLATES[lang].forgotPassword.welcomeText,
            message: TRANSLATES[lang].forgotPassword.message,
            message2: TRANSLATES[lang].forgotPassword.message2,
            message3: TRANSLATES[lang].forgotPassword.message3,
            linkText: TRANSLATES[lang].forgotPassword.linkText
          }
        },
        footer: {
          params: {
            year: new Date().getFullYear(),
            appName: this.configSerive.get('app').appName
          }
        }
      },
      receivers: [existUser.email],
      subject: TRANSLATES[lang].forgotPassword.subject
    });
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
