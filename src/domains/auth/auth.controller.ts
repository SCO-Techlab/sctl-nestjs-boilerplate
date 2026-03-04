import { IUser } from '@domains/users';
import { IJwtToken } from '@modules/jwt';
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { APP_CONTROLLERS } from '@shared/constants';
import { Lang } from '@shared/decorators';
import { AuthLoginDto, AuthRefreshDto, AuthRegisterDto, AuthResetPasswordDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller(APP_CONTROLLERS.AUTH)
export class AuthController {

  constructor(
    private readonly authService: AuthService
  ) { }

  @Post('login')
  async login(@Body() login: AuthLoginDto): Promise<IJwtToken> {
    return await this.authService.login(login);
  }

  @Post('refresh/:email')
  async refresh(
    @Param('email') email: string,
    @Body() authRefreshDto: AuthRefreshDto
  ): Promise<IJwtToken> {
    return await this.authService.refresh(email, authRefreshDto);
  }

  @Post('register')
  async register(
    @Lang() lang: string,
    @Body() registerDto: AuthRegisterDto
  ): Promise<boolean> {
    return await this.authService.register(registerDto, lang);
  }

  @Get('find/user/:email')
  async findUser(@Param('email') email: string): Promise<IUser> {
    return await this.authService.findUser(email);
  }

  @Get('confirm/email/:email')
  async confirmEmail(@Param('email') email: string): Promise<boolean> {
    return await this.authService.confirmUserEmaiil(email);
  }

  @Get('forgot/password/:email')
  async forgotPassword(
    @Lang() lang: string,
    @Param('email') email: string
  ): Promise<boolean> {
    return await this.authService.forgotPassword(email, lang);
  }

  @Get('recover/password/find/:pwdRecoveryToken')
  async recoverPasswordFind(@Param('pwdRecoveryToken') pwdRecoveryToken: string): Promise<IUser> {
    return await this.authService.recoverPasswordFind(pwdRecoveryToken);
  }

  @Put('recover/password/reset')
  async recoverPasswordReset(@Body() passwordResetDto: AuthResetPasswordDto): Promise<boolean> {
    return await this.authService.recoverPasswordReset(passwordResetDto);
  }
}
