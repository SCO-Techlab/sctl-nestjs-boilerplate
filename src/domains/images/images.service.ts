import { ResidencesRepository } from "@domains/residences";
import { RoomsRepository } from "@domains/rooms";
import { TenantsRepository } from "@domains/tenants";
import { UsersRepository } from "@domains/users";
import { Injectable, NotFoundException } from "@nestjs/common";
import { formatObjectId } from "@shared/helpers";
import { IResidence, IRoom, ITenant, IUser } from "@shared/interfaces";
import { ITenantImages } from "./images.interface";

@Injectable()
export class ImagesService {

  constructor(
    private readonly tenantsRepository: TenantsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly residencesRepository: ResidencesRepository,
    private readonly roomsRepository: RoomsRepository,
  ) { }

  public async getTenantImages(tenantId: string, userId: string): Promise<ITenantImages> {
    const existTenant: ITenant = await this.tenantsRepository.findOne(tenantId) as ITenant;
    if (!existTenant) {
      throw new NotFoundException('Tenant not found');
    }

    const existUser: IUser = await this.usersRepository.findOne(userId) as IUser;
    if (!existUser) {
      throw new NotFoundException('User not found');
    }

    if (!this.userIsOnTenant(existTenant, existUser)) {
      throw new NotFoundException('User is not part of the tenant');
    }

    const residences = await this.residencesRepository.find({ tenant: existTenant }) ?? [];
    const rooms = await this.roomsRepository.find({ tenant: existTenant }) ?? [];

    return {
      residences: residences as IResidence[],
      rooms: rooms as IRoom[]
    };
  }

  private userIsOnTenant(tenant: ITenant, user: IUser): boolean {
    const userIsOwner = formatObjectId(user._id as string) === formatObjectId(tenant.owner._id as string);
    if (userIsOwner) {
      return true;
    }

    const userIsMember = tenant?.members?.some(member => formatObjectId(member._id as string) === formatObjectId(user._id as string));
    if (userIsMember) {
      return true;
    }

    return false;
  }
}
