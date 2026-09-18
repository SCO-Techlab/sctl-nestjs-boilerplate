import { IGridfsFileStream } from '@core/gridfs';
import { IJwtToken } from '@core/jwt';
import { Body, Controller, Delete, Get, Param, Put, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { APP_CONTROLLERS } from '@shared/constants';
import { User } from '@shared/decorators';
import { UpdatePasswordDto } from '@shared/dtos';
import { UserGuard } from '@shared/guards';
import { IMenuFront, ITenant, IUser } from '@shared/interfaces';
import * as types from '@shared/types';
import express from 'express';
import { UpdateUserInfoDto, UpdateUserTenantDto } from './profile.dto';
import { ProfileService } from './profile.service';

@Controller(APP_CONTROLLERS.PROFILE)
export class ProfileController {

  constructor(private readonly profileService: ProfileService) { }

  @Put('update/user/info/:_id')
  @UseGuards(AuthGuard(), UserGuard)
  async updateUserInfo(
    @User() requestUser: types.RequestUser,
    @Param('_id') _id: string,
    @Body() updateUserInfoDto: UpdateUserInfoDto
  ): Promise<IJwtToken> {
    return await this.profileService.updateUserInfo(_id, updateUserInfoDto, requestUser as IUser);
  }

  @Put('update/user/password/:_id')
  @UseGuards(AuthGuard(), UserGuard)
  async updateUserPassword(
    @User() requestUser: types.RequestUser,
    @Param('_id') _id: string,
    @Body() updatePasswordDto: UpdatePasswordDto
  ): Promise<boolean> {
    return await this.profileService.updateUserPassword(_id, updatePasswordDto, requestUser as IUser);
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

  @Get('get/tenant/avatar/:_id/:_tenantId/:_avatarId')
  async getTenantAvatar(
    @Param('_id') _id: string,
    @Param('_tenantId') _tenantId: string,
    @Param('_avatarId') _avatarId: string,
    @Res() res: express.Response
  ) {
    const gridfsFileStream: IGridfsFileStream = await this.profileService.getTenantAvatar(_id, _tenantId, _avatarId);

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
    @User() requestUser: types.RequestUser,
    @Param('_id') _id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<IJwtToken> {
    return await this.profileService.updateUserAvatar(_id, file, requestUser as IUser);
  }

  @Put('update/tenant/avatar/:_id/:_tenantId')
  @UseGuards(AuthGuard(), UserGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateTenantAvatar(
    @User() requestUser: types.RequestUser,
    @Param('_id') _id: string,
    @Param('_tenantId') _tenantId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ITenant> {
    return await this.profileService.updateTenantAvatar(_id, _tenantId, file, requestUser as IUser);
  }

  @Delete('delete/user/avatar/:_id')
  @UseGuards(AuthGuard(), UserGuard)
  async deleteUserAvatar(
    @User() requestUser: types.RequestUser,
    @Param('_id') _id: string,
  ): Promise<IJwtToken> {
    return await this.profileService.deleteUserAvatar(_id, requestUser as IUser);
  }

  @Delete('delete/tenant/avatar/:_id/:_tenantId')
  @UseGuards(AuthGuard(), UserGuard)
  async deleteTenantAvatar(
    @User() requestUser: types.RequestUser,
    @Param('_id') _id: string,
    @Param('_tenantId') _tenantId: string,
  ): Promise<ITenant> {
    return await this.profileService.deleteTenantAvatar(_id, _tenantId, requestUser as IUser);
  }

  @Delete('delete/user/account/:_id')
  @UseGuards(AuthGuard(), UserGuard)
  async deleteUserAccount(
    @User() requestUser: types.RequestUser,
    @Param('_id') _id: string,
  ): Promise<boolean> {
    return await this.profileService.deleteUserAccount(_id, requestUser as IUser);
  }

  @Get('get/user/menu-front/:_id')
  @UseGuards(AuthGuard(), UserGuard)
  async getUserMenuFront(
    @User() requestUser: types.RequestUser,
    @Param('_id') _id: string,
  ): Promise<IMenuFront[]> {
    return await this.profileService.getUserMenuFront(_id, requestUser as IUser);
  }

  @Get('get/user/tenants/:_id')
  @UseGuards(AuthGuard(), UserGuard)
  async getUserTenants(
    @User() requestUser: types.RequestUser,
    @Param('_id') _id: string,
  ): Promise<ITenant[]> {
    return await this.profileService.getUserTenants(_id, requestUser as IUser);
  }

  @Put('update/user/tenant/:_id')
  @UseGuards(AuthGuard(), UserGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateUserTenant(
    @User() requestUser: types.RequestUser,
    @Param('_id') _id: string,
    @Body() updateUserTenantDto: UpdateUserTenantDto
  ): Promise<ITenant> {
    return await this.profileService.updateUserTenant(_id, updateUserTenantDto, requestUser as IUser);
  }
}