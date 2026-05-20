import { IJwtToken } from '@core/jwt';
import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS } from '@shared/constants';
import { Lang, User } from '@shared/decorators';
import { IUser } from '@shared/interfaces';
import * as types from '@shared/types';
import { AuthLoginDto, AuthRefreshLoginDto, AuthRegisterDto, AuthResetPasswordDto } from './auth.dto';
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

  @Post('refresh/login')
  async refreshLogin(@Body() refreshLogin: AuthRefreshLoginDto): Promise<IJwtToken> {
    return await this.authService.refreshLogin(refreshLogin);
  }

  @Post('logout')
  @UseGuards(AuthGuard())
  async logout(@User() requestUser: types.RequestUser,): Promise<boolean> {
    return await this.authService.logout(requestUser as IUser);
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
