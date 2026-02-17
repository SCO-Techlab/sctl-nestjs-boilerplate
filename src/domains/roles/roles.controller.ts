import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS, MAGIC_STRINGS } from '@shared/constants';
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
  async save(@Body() role: RoleDto): Promise<IRole | undefined> {
    const existRoleName: IRole = await this.rolesService.findOne(role.name, MAGIC_STRINGS.NAME) as IRole;
    if (existRoleName) {
      console.error(`[RolesController] save -> Role with name '${role.name}' already exists`);
      throw new BadRequestException(`Role with name '${role.name}' already exists`);
    }

    return await this.rolesService.save(role);
  }

  @Put(MAGIC_STRINGS.UNDERSCORE_ID_PARAM)
  @UseGuards(AuthGuard())
  async updateOne(
    @Param(MAGIC_STRINGS.UNDERSCORE_ID) _id: string,
    @Body() role: RoleDto
  ): Promise<IRole | undefined> {
    const existRole: IRole = await this.rolesService.findOne(_id) as IRole;
    if (!existRole) {
      console.error(`[RolesController] updateOne -> Role with id '${_id}' does not exist`);
      throw new BadRequestException(`Role with id '${_id}' does not exist`);
    }

    if (existRole.name !== role.name) {
      const updateRoleName: IRole = await this.rolesService.findOne(role.name, MAGIC_STRINGS.NAME) as IRole;
      if (updateRoleName) {
        console.error(`[RolesController] updateOne -> Role with name '${role.name}' already exists`);
        throw new BadRequestException(`Role with name '${role.name}' already exists`);
      }
    }

    return await this.rolesService.updateOne(_id, role);
  }

  @Delete(MAGIC_STRINGS.UNDERSCORE_ID_PARAM)
  @UseGuards(AuthGuard())
  async deleteRole(@Param(MAGIC_STRINGS.UNDERSCORE_ID) _id: string): Promise<boolean> {
    const existRole: IRole = await this.rolesService.findOne(_id) as IRole;
    if (!existRole) {
      console.error(`[RolesController] deleteRole -> Role with id '${_id}' does not exist`);
      throw new BadRequestException(`Role with id '${_id}' does not exist`);
    }

    return await this.rolesService.deleteRole(_id);
  }
}
