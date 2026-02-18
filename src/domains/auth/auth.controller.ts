import { IUser } from '@domains/users';
import { IJwtToken } from '@modules/jwt';
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { APP_CONTROLLERS } from '@shared/constants';
import { AuthLoginDto, AuthRegisterDto, AuthResetPasswordDto } from './auth.dto';
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

  @Post('register')
  async register(@Body() registerDto: AuthRegisterDto): Promise<boolean> {
    return await this.authService.register(registerDto);
  }

  @Get('confirm/email/:email')
  async confirmEmail(@Param('email') email: string): Promise<boolean> {
    return await this.authService.confirmUserEmaiil(email);
  }

  @Get('forgot/password/:email')
  async forgotPassword(@Param('email') email: string): Promise<boolean> {
    return await this.authService.forgotPassword(email);
  }

  @Get('password/recovery/find/:pwdRecoveryToken')
  async passwordRecoveryFind(@Param('pwdRecoveryToken') pwdRecoveryToken: string): Promise<IUser> {
    return await this.authService.passwordRecoveryFind(pwdRecoveryToken);
  }

  @Put('password/recovery/reset/:pwdRecoveryToken')
  async resetPassword(
    @Param('pwdRecoveryToken') pwdRecoveryToken: string,
    @Body() passwordResetDto: AuthResetPasswordDto
  ): Promise<boolean> {
    return await this.authService.passwordRecoveryReset(pwdRecoveryToken, passwordResetDto.password);
  }
}
