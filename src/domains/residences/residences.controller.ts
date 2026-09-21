import { MultitenancyEnabledGuard, TenantsGuard } from '@core/guards';
import { MongodbBulkDeleteDto, MongodbBulkUpdateDto } from '@core/mongodb';
import { TenantDto } from '@domains/tenants/tenants.dto';
import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS, PERMISSIONS } from '@shared/constants';
import { Permissions, Tenant } from '@shared/decorators';
import { PERMISSION_TYPE } from '@shared/enums';
import { PermissionsGuard } from '@shared/guards';
import { formatObjectId } from '@shared/helpers';
import { IResidence } from '@shared/interfaces';
import { ResidenceDto } from './residences.dto';
import { ResidencesRepository } from './residences.repository';

@Controller(APP_CONTROLLERS.RESIDENCES)
@UseGuards(AuthGuard())
export class ResidencesController {

  constructor(private readonly residencesRepository: ResidencesRepository) { }

  @Get()
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard, TenantsGuard)
  @Permissions({ name: PERMISSIONS.RESIDENCES, type: PERMISSION_TYPE.READ })
  async find(
    @Tenant() tenantId: string,
    @Query() query: any
  ): Promise<IResidence[] | any> {
    return this.residencesRepository.find({ ...query, tenant: tenantId });
  }

  @Get(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard, TenantsGuard)
  @Permissions({ name: PERMISSIONS.RESIDENCES, type: PERMISSION_TYPE.READ })
  async findOne(
    @Tenant() tenantId: string,
    @Param('_id') _id: string
  ): Promise<IResidence | undefined> {
    const value = await this.residencesRepository.findOne(_id, '_id') as IResidence;
    if (formatObjectId(value?.tenant?._id as string) !== formatObjectId(tenantId)) {
      return undefined;
    }

    return value;
  }

  @Post()
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard, TenantsGuard)
  @Permissions({ name: PERMISSIONS.RESIDENCES, type: PERMISSION_TYPE.CREATE })
  async create(
    @Tenant() tenantId: string,
    @Body() dto: ResidenceDto
  ): Promise<IResidence> {
    if (formatObjectId(dto.tenant) !== formatObjectId(tenantId)) {
      throw new NotFoundException('Tenant not found');
    }

    const entity = await this.residencesRepository.dtoToEntity(dto);
    return await this.residencesRepository.save(entity as IResidence) as IResidence;
  }

  @Put(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard, TenantsGuard)
  @Permissions({ name: PERMISSIONS.RESIDENCES, type: PERMISSION_TYPE.UPDATE })
  async update(
    @Tenant() tenantId: string,
    @Param('_id') _id: string,
    @Body() dto: ResidenceDto
  ): Promise<IResidence> {
    if (formatObjectId(dto.tenant) !== formatObjectId(tenantId)) {
      throw new NotFoundException('Tenant not found');
    }

    const entity = await this.residencesRepository.dtoToEntity(dto);
    return this.residencesRepository.updateOne(_id, entity as IResidence);
  }

  @Put('update/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard, TenantsGuard)
  @Permissions({ name: PERMISSIONS.RESIDENCES, type: PERMISSION_TYPE.UPDATE_BULK })
  async updateMany(
    @Tenant() tenantId: string,
    @Body() bulkUpdate: MongodbBulkUpdateDto<TenantDto>
  ): Promise<number> {
    const filter = { _id: { $in: bulkUpdate._ids }, tenant: tenantId };
    return await this.residencesRepository.updateMany(filter, bulkUpdate.data);
  }

  @Delete(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard, TenantsGuard)
  @Permissions({ name: PERMISSIONS.RESIDENCES, type: PERMISSION_TYPE.DELETE })
  async delete(
    @Tenant() tenantId: string,
    @Param('_id') _id: string
  ): Promise<boolean> {
    const value = await this.residencesRepository.findOne(_id, '_id') as IResidence;
    if (formatObjectId(value?.tenant?._id as string) !== formatObjectId(tenantId)) {
      throw new NotFoundException('Tenant not found');
    }

    return this.residencesRepository.deleteOne(_id);
  }

  @Delete('delete/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard, TenantsGuard)
  @Permissions({ name: PERMISSIONS.RESIDENCES, type: PERMISSION_TYPE.DELETE_BULK })
  async deleteMany(
    @Tenant() tenantId: string,
    @Body() bulkDelete: MongodbBulkDeleteDto
  ): Promise<number> {
    const filter = { _id: { $in: bulkDelete._ids }, tenant: tenantId };
    return await this.residencesRepository.deleteMany(filter);
  }
}
