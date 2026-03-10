import { IUser } from '@domains/users';
import { IGridfsFileStream } from '@modules/gridfs';
import { IJwtToken } from '@modules/jwt';
import { Body, Controller, Delete, Get, Param, Put, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { APP_CONTROLLERS } from '@shared/constants';
import { User } from '@shared/decorators';
import { UserGuard } from '@shared/guards';
import * as types from '@shared/types';
import express from 'express';
import { UpdateUserInfoDto, UpdateUserPasswordDto } from './profile.dto';
import { ProfileService } from './profile.service';

@Controller(APP_CONTROLLERS.PROFILE)
export class ProfileController {

  constructor(private profileService: ProfileService) { }

  @Put('update/user/info/:_id')
  @UseGuards(AuthGuard(), UserGuard)
  async updateUserInfo(
    @User() requestUser: types.IRequestUser,
    @Param('_id') _id: string,
    @Body() updateUserInfoDto: UpdateUserInfoDto
  ): Promise<IJwtToken> {
    return await this.profileService.updateUserInfo(_id, updateUserInfoDto, requestUser as IUser);
  }

  @Put('update/user/password/:_id')
  @UseGuards(AuthGuard(), UserGuard)
  async updateUserPassword(
    @User() requestUser: types.IRequestUser,
    @Param('_id') _id: string,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto
  ): Promise<boolean> {
    return await this.profileService.updateUserPassword(_id, updateUserPasswordDto, requestUser as IUser);
  }

  @Get('get/user/avatar/:_id/:_avatarId')
  async getUserAvatar(
    @Param('_id') _id: string,
    @Param('_avatarId') _avatarId: string,
    @Res() res: express.Response
  ) {
    const gridfsFileStream: IGridfsFileStream = await this.profileService.getUserAvatar(_id, _avatarId);

    res.set({
      'Content-Type': gridfsFileStream.file.metadata?.mimetype,
      'Content-Length': gridfsFileStream.file.length,
    });

    gridfsFileStream.stream.pipe(res);
  }

  @Put('update/user/avatar/:_id')
  @UseGuards(AuthGuard(), UserGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateUserAvatar(
    @User() requestUser: types.IRequestUser,
    @Param('_id') _id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<IJwtToken> {
    return await this.profileService.updateUserAvatar(_id, file, requestUser as IUser);
  }

  @Delete('delete/user/account/:_id')
  @UseGuards(AuthGuard(), UserGuard)
  async deleteUserAccount(
    @User() requestUser: types.IRequestUser,
    @Param('_id') _id: string,
  ): Promise<boolean> {
    return await this.profileService.deleteUserAccount(_id, requestUser as IUser);
  }
}