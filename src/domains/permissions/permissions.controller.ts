import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS, MAGIC_STRINGS } from '@shared/constants';
import { MongodbBulkDeleteDto, MongodbBulkUpdateDto } from '@shared/dtos';
import { IPaginationResponse } from '@shared/interfaces';
import * as types from '@shared/types';
import { PermissionCreateDto, PermissionUpdateDto } from './permissions.dto';
import { IPermission } from './permissions.interface';
import { PermissionsService } from './permissions.service';

@Controller(APP_CONTROLLERS.PERMISSIONS)
export class PermissionsController {

  constructor(private permissionsService: PermissionsService) { }

  @Get()
  @UseGuards(AuthGuard())
  async find(@Query() query?: types.IEntityQuery<IPermission>): Promise<IPermission[] | IPaginationResponse<IPermission>> {
    return await this.permissionsService.find(query);
  }

  @Get(MAGIC_STRINGS.UNDERSCORE_ID_PARAM)
  @UseGuards(AuthGuard())
  async findOne(@Param(MAGIC_STRINGS.UNDERSCORE_ID) _id: string): Promise<IPermission | undefined> {
    return await this.permissionsService.findOne(_id);
  }

  @Post()
  @UseGuards(AuthGuard())
  async save(@Body() permission: PermissionCreateDto): Promise<IPermission> {
    return await this.permissionsService.save(permission);
  }

  @Put(MAGIC_STRINGS.UNDERSCORE_ID_PARAM)
  @UseGuards(AuthGuard())
  async updateOne(
    @Param(MAGIC_STRINGS.UNDERSCORE_ID) _id: string,
    @Body() permission: PermissionUpdateDto
  ): Promise<IPermission | undefined> {
    return await this.permissionsService.updateOne(_id, permission);
  }

  @Put(`update/${MAGIC_STRINGS.BULK}`)
  @UseGuards(AuthGuard())
  async updateMany(@Body() bulkUpdate: MongodbBulkUpdateDto<PermissionUpdateDto>): Promise<number> {
    const filter = { _id: { $in: bulkUpdate._ids } };
    return await this.permissionsService.updateMany(filter, bulkUpdate.data);
  }

  @Delete(MAGIC_STRINGS.UNDERSCORE_ID_PARAM)
  @UseGuards(AuthGuard())
  async deleteOne(@Param(MAGIC_STRINGS.UNDERSCORE_ID) _id: string): Promise<boolean> {
    return await this.permissionsService.deleteOne(_id);
  }

  @Delete(`delete/${MAGIC_STRINGS.BULK}`)
  @UseGuards(AuthGuard())
  async deleteMany(@Body() bulkDelete: MongodbBulkDeleteDto): Promise<number> {
    const filter = { _id: { $in: bulkDelete._ids } };
    return await this.permissionsService.deleteMany(filter);
  }
}
