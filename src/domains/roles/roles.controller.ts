import { PERMISSION_TYPE, PERMISSIONS } from '@domains/permissions';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS } from '@shared/constants';
import { Permissions } from '@shared/decorators';
import { MongodbBulkDeleteDto, MongodbBulkUpdateDto } from '@shared/dtos';
import { PermissionsGuard } from '@shared/guards';
import { IPaginationResponse } from '@shared/interfaces';
import * as types from '@shared/types';
import { RoleCreateDto, RoleUpdateDto } from './roles.dto';
import { IRole } from './roles.interface';
import { RolesService } from './roles.service';

@Controller(APP_CONTROLLERS.ROLES)
export class RolesController {

  constructor(private readonly rolesService: RolesService) { }

  @Get()
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.ROLES, type: PERMISSION_TYPE.READ })
  async find(@Query() query?: types.IEntityQuery<IRole>): Promise<IRole[] | IPaginationResponse<IRole>> {
    return await this.rolesService.find(query);
  }

  @Get(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.ROLES, type: PERMISSION_TYPE.READ })
  async findOne(@Param('_id') _id: string): Promise<IRole | undefined> {
    return await this.rolesService.findOne(_id);
  }

  @Post()
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.ROLES, type: PERMISSION_TYPE.CREATE })
  async save(@Body() role: RoleCreateDto): Promise<IRole> {
    return await this.rolesService.save(role);
  }

  @Put(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.ROLES, type: PERMISSION_TYPE.UPDATE })
  async updateOne(
    @Param('_id') _id: string,
    @Body() role: RoleUpdateDto
  ): Promise<IRole> {
    return await this.rolesService.updateOne(_id, role);
  }

  @Put('update/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.ROLES, type: PERMISSION_TYPE.UPDATE })
  async updateMany(@Body() bulkUpdate: MongodbBulkUpdateDto<RoleUpdateDto>): Promise<number> {
    const filter = { _id: { $in: bulkUpdate._ids } };
    return await this.rolesService.updateMany(filter, bulkUpdate.data);
  }

  @Delete(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.ROLES, type: PERMISSION_TYPE.DELETE })
  async deleteOne(@Param('_id') _id: string): Promise<boolean> {
    return await this.rolesService.deleteOne(_id);
  }

  @Delete('delete/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.ROLES, type: PERMISSION_TYPE.DELETE })
  async deleteMany(@Body() bulkDelete: MongodbBulkDeleteDto): Promise<number> {
    const filter = { _id: { $in: bulkDelete._ids } };
    return await this.rolesService.deleteMany(filter);
  }
}