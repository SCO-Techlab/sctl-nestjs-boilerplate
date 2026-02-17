import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS, MAGIC_STRINGS } from '@shared/constants';
import { MongodbBulkDeleteDto, MongodbBulkUpdateDto } from '@shared/dtos';
import { IPaginationResponse } from '@shared/interfaces';
import * as types from '@shared/types';
import { UserDto } from './users.dto';
import { IUser } from './users.interface';
import { UsersService } from './users.service';

@Controller(APP_CONTROLLERS.USERS)
export class UsersController {

  constructor(private usersService: UsersService) { }

  @Get()
  @UseGuards(AuthGuard())
  async find(@Query() query?: types.IEntityQuery<IUser>): Promise<IUser[] | IPaginationResponse<IUser>> {
    return await this.usersService.find(query);
  }

  @Get(MAGIC_STRINGS.UNDERSCORE_ID_PARAM)
  @UseGuards(AuthGuard())
  async findOne(@Param(MAGIC_STRINGS.UNDERSCORE_ID) _id: string): Promise<IUser | undefined> {
    return await this.usersService.findOne(_id);
  }

  @Post()
  @UseGuards(AuthGuard())
  async save(@Body() user: UserDto): Promise<IUser> {
    return await this.usersService.save(user);
  }

  @Put(MAGIC_STRINGS.UNDERSCORE_ID_PARAM)
  @UseGuards(AuthGuard())
  async updateOne(
    @Param(MAGIC_STRINGS.UNDERSCORE_ID) _id: string,
    @Body() user: UserDto
  ): Promise<IUser> {
    return await this.usersService.updateOne(_id, user);
  }

  @Put(`password/${MAGIC_STRINGS.UNDERSCORE_ID_PARAM}`)
  @UseGuards(AuthGuard())
  async updatePassword(
    @Param(MAGIC_STRINGS.UNDERSCORE_ID) _id: string,
    @Body() user: UserDto
  ): Promise<boolean> {
    return await this.usersService.updatePassword(_id, user);
  }

  @Put(`update/${MAGIC_STRINGS.BULK}`)
  @UseGuards(AuthGuard())
  async updateMany(@Body() bulkUpdate: MongodbBulkUpdateDto<UserDto>): Promise<number> {
    const filter = { _id: { $in: bulkUpdate._ids } };
    return await this.usersService.updateMany(filter, bulkUpdate.data);
  }

  @Delete(MAGIC_STRINGS.UNDERSCORE_ID_PARAM)
  @UseGuards(AuthGuard())
  async deleteOne(@Param(MAGIC_STRINGS.UNDERSCORE_ID) _id: string): Promise<boolean> {
    return await this.usersService.deleteOne(_id);
  }

  @Delete(`delete/${MAGIC_STRINGS.BULK}`)
  @UseGuards(AuthGuard())
  async deleteMany(@Body() bulkDelete: MongodbBulkDeleteDto): Promise<number> {
    const filter = { _id: { $in: bulkDelete._ids } };
    return await this.usersService.deleteMany(filter);
  }
}