import { LoggerService } from "@core/logger";
import { formatMongodbError, MongodbRepository } from "@core/mongodb";
import { MAGIC_NUMBERS } from "@core/shared/constants";
import { IMongodbRecord, IMongodbRepository, IPaginationResponse } from "@core/shared/interfaces";
import { EntityQuery } from "@core/shared/types";
import { RolesRepository } from "@domains/roles";
import { Injectable, NotFoundException } from "@nestjs/common";
import { COLLECTIONS } from "@shared/constants";
import { IMenuFront, IRole } from "@shared/interfaces";
import { Model, QueryFilter } from "mongoose";
import { MenuFrontDto } from "./menu-front.dto";
import { MENU_FRONT_SCHEMA } from "./menu-front.schema";

@Injectable()
export class MenuFrontRepository implements IMongodbRepository<IMenuFront> {

  private Model: Model<IMenuFront>;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly mongodbRepository: MongodbRepository,
    private readonly rolesRepository: RolesRepository
  ) { }

  async onModuleInit(): Promise<void> {
    try {
      this.Model = this.mongodbRepository.getModel(COLLECTIONS.MENU_FRONT.MODEL, MENU_FRONT_SCHEMA, COLLECTIONS.MENU_FRONT.COLLECTION);
      await this.mongodbRepository.setModelIndexes(this.Model);
    } catch (error) {
      this.loggerService.error(`[MenuFrontRepository] onModuleInit -> Error: ${error}`);
    }
  }

  async find(entityQuery?: EntityQuery<Partial<IMenuFront>>): Promise<IMenuFront[] | IPaginationResponse<IMenuFront>> {
    try {
      const response: IMenuFront[] | IPaginationResponse<IMenuFront> = await this.mongodbRepository.find<IMenuFront>(this.Model, entityQuery as EntityQuery<IMenuFront>) as IMenuFront[];
      const menu = this.sortMenuRecursive((response as any)?.data ?? response);
      return (response as any)?.data
        ? { ...response, data: menu }
        : menu;
    } catch (error) {
      throw formatMongodbError(error, 'MenuFrontRepository', 'find', this.loggerService);
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<IMenuFront | undefined> {
    const record: IMongodbRecord = { property, value };
    try {
      return await this.mongodbRepository.findOne<IMenuFront>(this.Model, record);
    } catch (error) {
      throw formatMongodbError(error, 'MenuFrontRepository', 'findOne', this.loggerService);
    }
  }

  async save(newValue: IMenuFront | Partial<IMenuFront>): Promise<IMenuFront | undefined> {
    const value: Partial<IMenuFront> = {
      label: newValue?.label ?? '',
      separator: newValue?.separator ?? false,
      icon: newValue?.icon ?? '',
      routerLink: newValue?.routerLink ?? '',
      items: newValue?.items ?? null,
      roles: newValue?.roles ?? [],
      order: newValue?.order ?? MAGIC_NUMBERS.N_0
    };

    try {
      return await this.mongodbRepository.save<IMenuFront>(this.Model, value);
    } catch (error) {
      throw formatMongodbError(error, 'MenuFrontRepository', 'save', this.loggerService);
    }
  }

  async updateOne(_id: string, updateValue: IMenuFront | Partial<IMenuFront>): Promise<IMenuFront | undefined> {
    const record: IMongodbRecord = { property: '_id', value: _id };

    const value: Partial<IMenuFront> = {
      label: updateValue?.label ?? '',
      separator: updateValue?.separator ?? false,
      icon: updateValue?.icon ?? '',
      routerLink: updateValue?.routerLink ?? '',
      items: updateValue?.items ?? null,
      roles: updateValue?.roles ?? [],
      order: updateValue?.order ?? MAGIC_NUMBERS.N_0
    };

    try {
      const result: IMenuFront = await this.mongodbRepository.updateOne<IMenuFront>(this.Model, record, value) as IMenuFront;
      if (!result) {
        throw new NotFoundException(`Front menu not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'MenuFrontRepository', 'updateOne', this.loggerService);
    }
  }

  async updateMany(filter: QueryFilter<IMenuFront>, update: IMenuFront | Partial<IMenuFront>): Promise<number> {
    try {
      return await this.mongodbRepository.updateMany<IMenuFront>(this.Model, filter, update as Partial<IMenuFront>);
    } catch (error) {
      throw formatMongodbError(error, 'MenuFrontRepository', 'updateMany', this.loggerService);
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    const record: IMongodbRecord = { property: '_id', value: _id };
    try {
      const result: boolean = await this.mongodbRepository.deleteOne<IMenuFront>(this.Model, record);
      if (!result) {
        throw new NotFoundException(`Permission not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'MenuFrontRepository', 'deleteOne', this.loggerService);
    }
  }

  async deleteMany(filter: QueryFilter<IMenuFront>): Promise<number> {
    try {
      return await this.mongodbRepository.deleteMany(this.Model, filter);
    } catch (error) {
      throw formatMongodbError(error, 'MenuFrontRepository', 'deleteMany', this.loggerService);
    }
  }

  async dtoToEntity(dto: MenuFrontDto): Promise<IMenuFront | undefined> {
    const keys: string[] = Object.keys(dto ?? {});
    if (!keys?.length) {
      return undefined;
    }

    if (dto?._id) {
      const existRecord = await this.findOne(dto._id, '_id');
      if (existRecord) {
        return existRecord;
      }
    }

    const roles: IRole[] | undefined = [];
    if (dto?.roles?.length) {
      for await (const roleId of dto.roles) {
        const existRole = await this.rolesRepository.findOne(roleId, '_id');
        if (existRole) {
          roles.push(existRole);
        }
      }
    }

    const entity: IMenuFront = {
      _id: dto?._id ?? undefined,
      label: dto?.label ?? '',
      separator: dto?.separator ?? false,
      icon: dto?.icon ?? '',
      routerLink: dto?.routerLink ?? '',
      items: dto?.items ?? null,
      roles,
      order: dto?.order ?? MAGIC_NUMBERS.N_0,
      createdAt: dto?.createdAt ?? undefined,
      updatedAt: dto?.updatedAt ?? undefined,
      __v: dto?.__v ?? undefined
    };

    return entity;
  }

  private sortMenuRecursive(menu: IMenuFront[]): IMenuFront[] {
    if (!menu || menu.length === MAGIC_NUMBERS.N_0) {
      return [];
    }

    menu.sort(
      (a, b) =>
        (a?.order ?? MAGIC_NUMBERS.N_0) -
        (b?.order ?? MAGIC_NUMBERS.N_0)
    );

    for (const item of menu) {
      if (item.items && item.items.length > MAGIC_NUMBERS.N_0) {
        item.items = this.sortMenuRecursive(item.items);
      }
    }

    return menu;
  }
}
