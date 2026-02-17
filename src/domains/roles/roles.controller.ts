import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS, MAGIC_STRINGS } from '@shared/constants';
import { MongodbBulkDeleteDto, MongodbBulkUpdateDto } from '@shared/dtos';
import { IPaginationResponse } from '@shared/interfaces';
import * as types from '@shared/types';
import { RoleDto } from './roles.dto';
import { IRole } from './roles.interface';
import { RolesService } from './roles.service';

@Controller(APP_CONTROLLERS.ROLES)
export class RolesController {

  constructor(private readonly rolesService: RolesService) { }

  @Get()
  @UseGuards(AuthGuard())
  async find(@Query() query?: types.IEntityQuery<IRole>): Promise<IRole[] | IPaginationResponse<IRole>> {
    return await this.rolesService.find(query);
  }

  @Get(MAGIC_STRINGS.UNDERSCORE_ID_PARAM)
  @UseGuards(AuthGuard())
  async findOne(@Param(MAGIC_STRINGS.UNDERSCORE_ID) _id: string): Promise<IRole | undefined> {
    return await this.rolesService.findOne(_id);
  }

  @Post()
  @UseGuards(AuthGuard())
  async save(@Body() role: RoleDto): Promise<IRole> {
    return await this.rolesService.save(role);
  }

  @Put(MAGIC_STRINGS.UNDERSCORE_ID_PARAM)
  @UseGuards(AuthGuard())
  async updateOne(
    @Param(MAGIC_STRINGS.UNDERSCORE_ID) _id: string,
    @Body() role: RoleDto
  ): Promise<IRole> {
    return await this.rolesService.updateOne(_id, role);
  }

  @Put(`update/${MAGIC_STRINGS.BULK}`)
  @UseGuards(AuthGuard())
  async updateMany(@Body() bulkUpdate: MongodbBulkUpdateDto<RoleDto>): Promise<number> {
    const filter = { _id: { $in: bulkUpdate._ids } };
    return await this.rolesService.updateMany(filter, bulkUpdate.data);
  }

  @Delete(MAGIC_STRINGS.UNDERSCORE_ID_PARAM)
  @UseGuards(AuthGuard())
  async deleteOne(@Param(MAGIC_STRINGS.UNDERSCORE_ID) _id: string): Promise<boolean> {
    return await this.rolesService.deleteOne(_id);
  }

  @Delete(`delete/${MAGIC_STRINGS.BULK}`)
  @UseGuards(AuthGuard())
  async deleteMany(@Body() bulkDelete: MongodbBulkDeleteDto): Promise<number> {
    const filter = { _id: { $in: bulkDelete._ids } };
    return await this.rolesService.deleteMany(filter);
  }
}