import { BUCKETS, GridfsService, IGridfsFile, IGridfsGetFileOptions } from "@core/gridfs";
import { MAGIC_NUMBERS } from "@core/shared/constants";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ITenant } from "@shared/interfaces";
import { TenantsRepository } from "./tenants.repository";

@Injectable()
export class TenantsService {

  constructor(
    private readonly repository: TenantsRepository,
    private readonly gridfsService: GridfsService,
  ) { }

  public async tenantAvailableByUser(_id: string, _userId: string): Promise<boolean> {
    const userTenants: ITenant[] = await this.getUserTenants(_userId);
    if (!userTenants || userTenants.length === MAGIC_NUMBERS.N_0) {
      return false;
    }

    const existTenant: ITenant = await this.repository.findOne(_id) as ITenant;
    if (!existTenant) {
      return false;
    }

    return userTenants.find(tenant => tenant._id === existTenant._id) !== undefined;
  }

  public async getUserTenants(_id: string): Promise<ITenant[]> {
    const tenants: ITenant[] = await this.repository.find({
      isActive: true,
      $or: [
        { owner: _id },
        { members: _id },
      ],
    } as any) as ITenant[];

    if (!tenants || tenants.length === MAGIC_NUMBERS.N_0) {
      return [];
    }

    return tenants;
  }

  async deleteTenantAvatar(_id: string): Promise<boolean> {
    const existTenant: ITenant = await this.repository.findOne(_id) as ITenant;
    if (!existTenant) {
      throw new NotFoundException('Tenant not found');
    }

    try {
      const currentAvatarId = existTenant.avatar as string | undefined;
      if (currentAvatarId) {
        const getOptions: IGridfsGetFileOptions = { filter: { _id: currentAvatarId } };
        const currentAvatar: IGridfsFile = (await this.gridfsService.getFiles(BUCKETS.TENANTS_AVATARS, getOptions))[MAGIC_NUMBERS.N_0];
        if (currentAvatar) {
          await this.gridfsService.deleteFiles(BUCKETS.TENANTS_AVATARS, [currentAvatar._id as string]);
        }
      }

      return await this.repository.deleteAvatar(_id);
    } catch {
      return false;
    }
  }
}
