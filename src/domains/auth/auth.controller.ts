import { IUser } from '@domains/users';
import { IJwtToken } from '@modules/jwt';
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { APP_CONTROLLERS, MAGIC_STRINGS } from '@shared/constants';
import { Lang } from '@shared/decorators';
import { AuthLoginDto, AuthRegisterDto, AuthResetPasswordDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller(APP_CONTROLLERS.AUTH)
export class AuthController {

  constructor(
    private readonly authService: AuthService
  ) { }

  @Post(MAGIC_STRINGS.LOGIN)
  async login(@Body() login: AuthLoginDto): Promise<IJwtToken> {
    return await this.authService.login(login);
  }

  @Post(MAGIC_STRINGS.REGISTER)
  async register(
    @Lang() lang: string,
    @Body() registerDto: AuthRegisterDto
  ): Promise<boolean> {
    return await this.authService.register(registerDto, lang);
  }

  @Get(`${MAGIC_STRINGS.CONFIRM}/${MAGIC_STRINGS.EMAIL}/${MAGIC_STRINGS.EMAIL_PARAM}`)
  async confirmEmail(@Param(MAGIC_STRINGS.EMAIL) email: string): Promise<boolean> {
    return await this.authService.confirmUserEmaiil(email);
  }

  @Get(`${MAGIC_STRINGS.FORGOT}/${MAGIC_STRINGS.PASSWORD}/${MAGIC_STRINGS.EMAIL_PARAM}`)
  async forgotPassword(
    @Lang() lang: string,
    @Param(MAGIC_STRINGS.EMAIL) email: string
  ): Promise<boolean> {
    return await this.authService.forgotPassword(email, lang);
  }

  @Get(`${MAGIC_STRINGS.PASSWORD}/${MAGIC_STRINGS.RECOVERY}/${MAGIC_STRINGS.FIND}/${MAGIC_STRINGS.PWD_RECOVERY_TOKEN_PARAM}`)
  async passwordRecoveryFind(@Param(MAGIC_STRINGS.PWD_RECOVERY_TOKEN) pwdRecoveryToken: string): Promise<IUser> {
    return await this.authService.passwordRecoveryFind(pwdRecoveryToken);
  }

  @Put(`${MAGIC_STRINGS.PASSWORD}/${MAGIC_STRINGS.RECOVERY}/${MAGIC_STRINGS.RESET}/${MAGIC_STRINGS.PWD_RECOVERY_TOKEN_PARAM}`)
  async resetPassword(
    @Param(MAGIC_STRINGS.PWD_RECOVERY_TOKEN) pwdRecoveryToken: string,
    @Body() passwordResetDto: AuthResetPasswordDto
  ): Promise<boolean> {
    return await this.authService.passwordRecoveryReset(pwdRecoveryToken, passwordResetDto.password);
  }
}
