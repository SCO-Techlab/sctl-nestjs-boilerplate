import { IUser } from '@domains/users';
import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS } from '@shared/constants';
import { User } from '@shared/decorators';
import * as types from '@shared/types';
import { UpdateUserInfoDto } from './profile.dto';
import { ProfileService } from './profile.service';

@Controller(APP_CONTROLLERS.PROFILE)
export class ProfileController {

  constructor(private profileService: ProfileService) { }

  @Put('update/user/info/:_id')
  @UseGuards(AuthGuard())
  async updateUserInfo(
    @User() user: types.IRequestUser,
    @Param('_id') _id: string,
    @Body() updateUserInfoDto: UpdateUserInfoDto
  ): Promise<IUser> {
    return await this.profileService.updateUserInfo(_id, updateUserInfoDto, user as IUser);
  }
}