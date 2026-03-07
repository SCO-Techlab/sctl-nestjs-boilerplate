import { IUser } from '@domains/users';
import { IJwtToken } from '@modules/jwt';
import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS } from '@shared/constants';
import { User } from '@shared/decorators';
import * as types from '@shared/types';
import { UpdateUserInfoDto, UpdateUserPasswordDto } from './profile.dto';
import { ProfileService } from './profile.service';

@Controller(APP_CONTROLLERS.PROFILE)
export class ProfileController {

  constructor(private profileService: ProfileService) { }

  @Put('update/user/info/:_id')
  @UseGuards(AuthGuard())
  async updateUserInfo(
    @User() requestUser: types.IRequestUser,
    @Param('_id') _id: string,
    @Body() updateUserInfoDto: UpdateUserInfoDto
  ): Promise<IJwtToken> {
    return await this.profileService.updateUserInfo(_id, updateUserInfoDto, requestUser as IUser);
  }

  @Put('update/user/password/:_id')
  @UseGuards(AuthGuard())
  async updateUserPassword(
    @User() requestUser: types.IRequestUser,
    @Param('_id') _id: string,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto
  ): Promise<boolean> {
    return await this.profileService.updateUserPassword(_id, updateUserPasswordDto, requestUser as IUser);
  }
}