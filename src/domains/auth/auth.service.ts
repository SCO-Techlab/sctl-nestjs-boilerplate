import { IUser, UserPasswordUpdateDto, UsersService, UserUpdateDto } from '@domains/users';
import { EmailerService } from '@modules/emailer';
import { IJwtToken, JwtService } from '@modules/jwt';
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MAGIC_NUMBERS, MAGIC_STRINGS, TEMPLATES, TRANSLATES } from '@shared/constants';
import { getFrontendUrl } from '@shared/helpers';
import { BcryptService } from '@shared/services';
import { AuthLoginDto, AuthRegisterDto } from './auth.dto';
import { IAuthPayload } from './auth.interface';

@Injectable()
export class AuthService {

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private bcryptService: BcryptService,
    private configSerive: ConfigService,
    private emailerService: EmailerService
  ) { }

  public async login(login: AuthLoginDto): Promise<IJwtToken> {
    const exist_user: IUser = await this.usersService.findOne(login.email, MAGIC_STRINGS.EMAIL) as IUser;
    if (!exist_user) {
      throw this.getUnauthorizedError();
    }

    if (!exist_user.active) {
      throw this.getUnauthorizedError();
    }

    const passwordsMatch: boolean = await this.bcryptService.compare(login.password, exist_user.password);
    if (!passwordsMatch) {
      throw this.getUnauthorizedError();
    }

    const payload: IAuthPayload = {
      _id: exist_user._id as string,
      user: {
        _id: exist_user._id as string,
        email: exist_user.email,
        password: '',
        userName: exist_user.userName,
        personalName: exist_user.personalName,
        active: exist_user.active,
        emailConfirmed: exist_user.emailConfirmed,
        role: exist_user.role,
        pwdRecoveryToken: exist_user.pwdRecoveryToken,
        pwdRecoveryDate: exist_user.pwdRecoveryDate,
        extension: exist_user.extension,
      }
    };

    const token: IJwtToken = await this.jwtService.createToken(payload) as IJwtToken;
    if (!token) {
      throw this.getUnauthorizedError();
    }

    return token;
  }

  public async register(register: AuthRegisterDto, lang: string): Promise<boolean> {
    const { user } = register;

    const existUser: IUser = await this.usersService.findOne(user.email, MAGIC_STRINGS.EMAIL) as IUser;
    if (existUser) {
      throw new ConflictException('User with email already exists');
    }

    const createdUser: IUser = await this.usersService.save(user);
    if (!createdUser) {
      throw new ConflictException('Error creating user');
    }

    if (user.active !== true) {
      const emailSend: boolean = await this.emailerService.sendTemplate({
        template: TEMPLATES.WELCOME,
        context: {
          welcome: {
            params: {
              name: user.userName,
              link: getFrontendUrl(
                this.configSerive.get(MAGIC_STRINGS.APP).httpsEnabled,
                this.configSerive.get(MAGIC_STRINGS.APP).host,
                this.configSerive.get(MAGIC_STRINGS.APP).port,
                `${MAGIC_STRINGS.CONFIRM}${MAGIC_STRINGS.DASH}${MAGIC_STRINGS.EMAIL}${MAGIC_STRINGS.SLASH}${user.email}`
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
              appName: this.configSerive.get(MAGIC_STRINGS.APP).appName
            }
          }
        },
        receivers: [user.email],
        subject: TRANSLATES[lang].welcome.subject
      });
      if (!emailSend) {
        throw new ConflictException('Error sending registration email');
      }
    }

    return createdUser !== undefined;
  }

  public async confirmUserEmaiil(email: string): Promise<boolean> {
    const existUser: IUser = await this.usersService.findOne(email, MAGIC_STRINGS.EMAIL) as IUser;
    if (!existUser) {
      throw new NotFoundException(`User with email '${email}' does not exist`);
    }

    if (existUser.emailConfirmed) {
      throw new ConflictException('User email is already confirmed');
    }

    const userUpdateDto: UserUpdateDto = {
      emailConfirmed: true,
      active: true
    };

    const updatedUser: IUser = await this.usersService.updateOne(existUser._id as string, userUpdateDto);
    if (!updatedUser) {
      throw new ConflictException('Error confirming user email');
    }

    return true;
  }

  public async forgotPassword(email: string, lang: string): Promise<boolean> {
    const existUser: IUser = await this.usersService.findOne(email, MAGIC_STRINGS.EMAIL) as IUser;
    if (!existUser) {
      throw new NotFoundException(`User with email '${email}' does not exist`);
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
              this.configSerive.get(MAGIC_STRINGS.APP).httpsEnabled,
              this.configSerive.get(MAGIC_STRINGS.APP).host,
              this.configSerive.get(MAGIC_STRINGS.APP).port,
              `${MAGIC_STRINGS.FORGOT}${MAGIC_STRINGS.DASH}${MAGIC_STRINGS.PASSWORD}${MAGIC_STRINGS.SLASH}${existUser.pwdRecoveryToken}`
            ),
            expiration: this.configSerive.get(MAGIC_STRINGS.APP).pwdRecoveryExpiration ?? MAGIC_NUMBERS.N_30
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
            appName: this.configSerive.get(MAGIC_STRINGS.APP).appName
          }
        }
      },
      receivers: [existUser.email],
      subject: TRANSLATES[lang].welcome.subject
    });
    if (!emailSend) {
      throw new ConflictException('Error sending password recovery email');
    }

    return true;
  }

  public async passwordRecoveryFind(pwdRecoveryToken: string): Promise<IUser> {
    const existUser: IUser = await this.usersService.findOne(pwdRecoveryToken, 'pwdRecoveryToken') as IUser;
    if (!existUser) {
      throw this.getUnauthorizedError();
    }

    const minutes: number = this.configSerive.get('app').pwdRecoveryExpiration ?? MAGIC_NUMBERS.N_30;
    const expirationTime = minutes * MAGIC_NUMBERS.N_60 * MAGIC_NUMBERS.N_1000;
    if (existUser.pwdRecoveryDate && (Date.now() - existUser.pwdRecoveryDate.getTime()) > expirationTime) {
      throw this.getUnauthorizedError('Password recovery token is expired');
    }

    return existUser;
  }

  public async passwordRecoveryReset(pwdRecoveryToken: string, newPassword: string): Promise<boolean> {
    const existUser: IUser = await this.usersService.findOne(pwdRecoveryToken, 'pwdRecoveryToken') as IUser;
    if (!existUser) {
      throw this.getUnauthorizedError();
    }

    const userUpdatePasswordDto: UserPasswordUpdateDto = {
      password: newPassword,
      newPassword: newPassword,
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

  private getUnauthorizedError(message: string = MAGIC_STRINGS.UNAUTHORIZED): UnauthorizedException {
    return new UnauthorizedException(message);
  }
}
