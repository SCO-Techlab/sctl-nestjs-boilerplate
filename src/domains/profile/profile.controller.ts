import { IGridfsFileStream } from '@core/gridfs';
import { IJwtToken } from '@core/jwt';
import { Body, Controller, Delete, Get, Param, Put, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { APP_CONTROLLERS } from '@shared/constants';
import { User } from '@shared/decorators';
import { UpdatePasswordDto } from '@shared/dtos';
import { UserGuard } from '@shared/guards';
import { IMenuFront, IUser } from '@shared/interfaces';
import * as types from '@shared/types';
import express from 'express';
import { UpdateUserInfoDto, UpdateUserTenantDto } from './profile.dto';
import { ProfileService } from './profile.service';

@Controller(APP_CONTROLLERS.PROFILE)
export class ProfileController {

  constructor(private readonly profileService: ProfileService) { }

  @Put('update/user/info/:userId')
  @UseGuards(AuthGuard(), UserGuard)
  async updateUserInfo(
    @User() requestUser: types.RequestUser,
    @Param('userId') userId: string,
    @Body() updateUserInfoDto: UpdateUserInfoDto
  ): Promise<IJwtToken> {
    return await this.profileService.updateUserInfo(userId, updateUserInfoDto, requestUser as IUser);
  }

  @Put('update/user/password/:userId')
  @UseGuards(AuthGuard(), UserGuard)
  async updateUserPassword(
    @User() requestUser: types.RequestUser,
    @Param('userId') userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto
  ): Promise<boolean> {
    return await this.profileService.updateUserPassword(userId, updatePasswordDto, requestUser as IUser);
  }

  @Get('get/user/avatar/:userId/:avatarId')
  async getUserAvatar(
    @Param('userId') userId: string,
    @Param('avatarId') avatarId: string,
    @Res() res: express.Response
  ) {
    const gridfsFileStream: IGridfsFileStream = await this.profileService.getUserAvatar(userId, avatarId);

    res.set({
      'Content-Type': gridfsFileStream.file.metadata?.mimetype,
      'Content-Length': gridfsFileStream.file.length,
    });

    gridfsFileStream.stream.pipe(res);
  }

  @Get('get/tenant/avatar/:userId/:tenantId/:avatarId')
  async getTenantAvatar(
    @Param('userId') userId: string,
    @Param('tenantId') tenantId: string,
    @Param('avatarId') avatarId: string,
    @Res() res: express.Response
  ) {
    const gridfsFileStream: IGridfsFileStream = await this.profileService.getTenantAvatar(userId, tenantId, avatarId);

    res.set({
      'Content-Type': gridfsFileStream.file.metadata?.mimetype,
      'Content-Length': gridfsFileStream.file.length,
    });

    gridfsFileStream.stream.pipe(res);
  }

  @Put('update/user/avatar/:userId')
  @UseGuards(AuthGuard(), UserGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateUserAvatar(
    @User() requestUser: types.RequestUser,
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<IJwtToken> {
    return await this.profileService.updateUserAvatar(userId, file, requestUser as IUser);
  }

  @Put('update/tenant/avatar/:userId/:tenantId')
  @UseGuards(AuthGuard(), UserGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateTenantAvatar(
    @User() requestUser: types.RequestUser,
    @Param('userId') userId: string,
    @Param('tenantId') tenantId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<IJwtToken> {
    return await this.profileService.updateTenantAvatar(userId, tenantId, file, requestUser as IUser);
  }

  @Delete('delete/user/avatar/:userId')
  @UseGuards(AuthGuard(), UserGuard)
  async deleteUserAvatar(
    @User() requestUser: types.RequestUser,
    @Param('userId') userId: string,
  ): Promise<IJwtToken> {
    return await this.profileService.deleteUserAvatar(userId, requestUser as IUser);
  }

  @Delete('delete/tenant/avatar/:userId/:tenantId')
  @UseGuards(AuthGuard(), UserGuard)
  async deleteTenantAvatar(
    @User() requestUser: types.RequestUser,
    @Param('userId') userId: string,
    @Param('tenantId') tenantId: string,
  ): Promise<IJwtToken> {
    return await this.profileService.deleteTenantAvatar(userId, tenantId, requestUser as IUser);
  }

  @Delete('delete/user/account/:userId')
  @UseGuards(AuthGuard(), UserGuard)
  async deleteUserAccount(
    @User() requestUser: types.RequestUser,
    @Param('userId') userId: string,
  ): Promise<boolean> {
    return await this.profileService.deleteUserAccount(userId, requestUser as IUser);
  }

  @Get('get/user/menu-front/:userId')
  @UseGuards(AuthGuard(), UserGuard)
  async getUserMenuFront(
    @User() requestUser: types.RequestUser,
    @Param('userId') userId: string,
  ): Promise<IMenuFront[]> {
    return await this.profileService.getUserMenuFront(userId, requestUser as IUser);
  }

  @Put('update/user/tenant/:userId')
  @UseGuards(AuthGuard(), UserGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateUserTenant(
    @User() requestUser: types.RequestUser,
    @Param('userId') userId: string,
    @Body() updateUserTenantDto: UpdateUserTenantDto
  ): Promise<IJwtToken> {
    return await this.profileService.updateUserTenant(userId, updateUserTenantDto, requestUser as IUser);
  }
}