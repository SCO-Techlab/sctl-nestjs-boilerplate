import { MongodbBulkDeleteDto, MongodbBulkUpdateDto } from '@core/mongodb';
import { PERMISSION_TYPE, PERMISSIONS } from '@domains/permissions';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS } from '@shared/constants';
import { Lang, Permissions } from '@shared/decorators';
import { PermissionsGuard } from '@shared/guards';
import { IPaginationResponse, IUser } from '@shared/interfaces';
import * as types from '@shared/types';
import { UserCreateDto, UserPasswordUpdateDto, UserUpdateDto } from './users.dto';
import { UsersService } from './users.service';

@Controller(APP_CONTROLLERS.USERS)
export class UsersController {

  constructor(private usersService: UsersService) { }

  @Get()
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.READ })
  async find(@Query() query?: types.EntityQuery<IUser>): Promise<IUser[] | IPaginationResponse<IUser>> {
    return await this.usersService.find(query);
  }

  @Get(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.READ })
  async findOne(@Param('_id') _id: string): Promise<IUser | undefined> {
    return await this.usersService.findOne(_id);
  }

  @Get('send/welcome/email/:_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.CREATE })
  async sendWelcomeEmail(
    @Lang() lang: string,
    @Param('_id') _id: string
  ): Promise<boolean> {
    return await this.usersService.sendWelcomeEmail(_id, lang);
  }

  @Post()
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.CREATE })
  async save(@Body() user: UserCreateDto): Promise<IUser | undefined> {
    return await this.usersService.save(user);
  }

  @Put(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.UPDATE })
  async updateOne(
    @Param('_id') _id: string,
    @Body() user: UserUpdateDto
  ): Promise<IUser> {
    return await this.usersService.updateOne(_id, user);
  }

  @Put('password/:_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.UPDATE })
  async updatePassword(
    @Param('_id') _id: string,
    @Body() user: UserPasswordUpdateDto
  ): Promise<boolean> {
    return await this.usersService.updatePassword(_id, user, false);
  }

  @Put('delete/avatar/:_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.UPDATE })
  async deleteUserAvatar(@Param('_id') _id: string): Promise<boolean> {
    return await this.usersService.deleteUserAvatar(_id);
  }

  @Put('update/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.UPDATE_BULK })
  async updateMany(@Body() bulkUpdate: MongodbBulkUpdateDto<UserUpdateDto>): Promise<number> {
    const filter = { _id: { $in: bulkUpdate._ids } };
    return await this.usersService.updateMany(filter, bulkUpdate.data);
  }

  @Delete(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.DELETE })
  async deleteOne(@Param('_id') _id: string): Promise<boolean> {
    return await this.usersService.deleteOne(_id);
  }

  @Delete('delete/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.DELETE_BULK })
  async deleteMany(@Body() bulkDelete: MongodbBulkDeleteDto): Promise<number> {
    const filter = { _id: { $in: bulkDelete._ids } };
    return await this.usersService.deleteMany(filter);
  }
}