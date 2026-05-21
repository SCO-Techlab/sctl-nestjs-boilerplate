import { MongodbBulkDeleteDto, MongodbBulkUpdateDto } from '@core/shared/dtos';
import { IPaginationResponse } from '@core/shared/interfaces';
import * as coreTypes from '@core/shared/types';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS, PERMISSIONS } from '@shared/constants';
import { Lang, Permissions } from '@shared/decorators';
import { PERMISSION_TYPE } from '@shared/enums';
import { PermissionsGuard } from '@shared/guards';
import { IUser } from '@shared/interfaces';
import { UserCreateDto, UserPasswordUpdateDto, UserUpdateDto } from './users.dto';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Controller(APP_CONTROLLERS.USERS)
export class UsersController {

  constructor(
    private readonly repository: UsersRepository,
    private readonly service: UsersService
  ) { }

  @Get()
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.READ })
  async find(@Query() query?: coreTypes.EntityQuery<IUser>): Promise<IUser[] | IPaginationResponse<IUser>> {
    return await this.repository.find(query);
  }

  @Get(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.READ })
  async findOne(@Param('_id') _id: string): Promise<IUser | undefined> {
    return await this.repository.findOne(_id);
  }

  @Get('send/welcome/email/:_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.CREATE })
  async sendWelcomeEmail(
    @Lang() lang: string,
    @Param('_id') _id: string
  ): Promise<boolean> {
    return await this.service.sendWelcomeEmail(_id, lang);
  }

  @Post()
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.CREATE })
  async save(@Body() user: UserCreateDto): Promise<IUser | undefined> {
    return await this.repository.save(await this.repository.dtoToEntity(user) as IUser);
  }

  @Put(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.UPDATE })
  async updateOne(
    @Param('_id') _id: string,
    @Body() user: UserUpdateDto
  ): Promise<IUser> {
    return await this.repository.updateOne(_id, await this.repository.dtoToEntity(user) as IUser);
  }

  @Put('password/:_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.UPDATE })
  async updatePassword(
    @Param('_id') _id: string,
    @Body() user: UserPasswordUpdateDto
  ): Promise<boolean> {
    return await this.service.updatePassword(_id, user.password, user.newPassword, false);
  }

  @Put('delete/avatar/:_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.UPDATE })
  async deleteUserAvatar(@Param('_id') _id: string): Promise<boolean> {
    return await this.service.deleteUserAvatar(_id);
  }

  @Put('update/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.UPDATE_BULK })
  async updateMany(@Body() bulkUpdate: MongodbBulkUpdateDto<UserUpdateDto>): Promise<number> {
    const filter = { _id: { $in: bulkUpdate._ids } };
    return await this.repository.updateMany(filter, await this.repository.dtoToEntity(bulkUpdate.data) as IUser);
  }

  @Delete(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.DELETE })
  async deleteOne(@Param('_id') _id: string): Promise<boolean> {
    return await this.repository.deleteOne(_id);
  }

  @Delete('delete/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.USERS, type: PERMISSION_TYPE.DELETE_BULK })
  async deleteMany(@Body() bulkDelete: MongodbBulkDeleteDto): Promise<number> {
    const filter = { _id: { $in: bulkDelete._ids } };
    return await this.repository.deleteMany(filter);
  }
}