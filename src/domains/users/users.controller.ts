import { PERMISSION_TYPE, PERMISSIONS } from '@domains/permissions';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS } from '@shared/constants';
import { Permissions } from '@shared/decorators';
import { MongodbBulkDeleteDto, MongodbBulkUpdateDto } from '@shared/dtos';
import { PermissionsGuard } from '@shared/guards';
import { IPaginationResponse } from '@shared/interfaces';
import * as types from '@shared/types';
import { UserCreateDto, UserPasswordUpdateDto, UserUpdateDto } from './users.dto';
import { IUser } from './users.interface';
import { UsersService } from './users.service';

@Controller(APP_CONTROLLERS.USERS)
export class UsersController {

  constructor(private usersService: UsersService) { }

  @Get()
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.READ })
  async find(@Query() query?: types.IEntityQuery<IUser>): Promise<IUser[] | IPaginationResponse<IUser>> {
    return await this.usersService.find(query);
  }

  @Get(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.READ })
  async findOne(@Param('_id') _id: string): Promise<IUser | undefined> {
    return await this.usersService.findOne(_id);
  }

  @Post()
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.CREATE })
  async save(@Body() user: UserCreateDto): Promise<IUser> {
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
    return await this.usersService.updatePassword(_id, user);
  }

  @Put('update/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.UPDATE })
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
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.DELETE })
  async deleteMany(@Body() bulkDelete: MongodbBulkDeleteDto): Promise<number> {
    const filter = { _id: { $in: bulkDelete._ids } };
    return await this.usersService.deleteMany(filter);
  }
}