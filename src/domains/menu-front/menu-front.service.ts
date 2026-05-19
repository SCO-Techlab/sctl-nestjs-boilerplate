import { MongodbRepository } from "@core/mongodb";
import { IRole, RolesService } from "@domains/roles";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MAGIC_NUMBERS, MONGODB_CONSTANTS } from "@shared/constants";
import { formatMongodbError, sortMenuRecursive } from "@shared/helpers";
import { IMongodbRecord, IMongodbRepository, IPaginationResponse } from "@shared/interfaces";
import { IEntityQuery } from "@shared/types";
import { Model, QueryFilter } from "mongoose";
import { MenuFrontDto } from "./menu-front.dto";
import { IMenuFront } from "./menu-front.interface";
import { MENU_FRONT_SCHEMA } from "./menu-front.schema";

@Injectable()
export class MenuFrontService implements IMongodbRepository<IMenuFront> {

  private MenuFrontModel: Model<IMenuFront>;

  constructor(
    private mongodbRepository: MongodbRepository,
    private rolesService: RolesService
  ) { }

  async onModuleInit(): Promise<void> {
    this.MenuFrontModel = this.getModel() as Model<IMenuFront>;
    await this.setModelIndexes();
  }

  async find(entityQuery?: IEntityQuery<Partial<IMenuFront>>): Promise<IMenuFront[] | IPaginationResponse<IMenuFront>> {
    try {
      const response: IMenuFront[] | IPaginationResponse<IMenuFront> = await this.mongodbRepository.find<IMenuFront>(this.MenuFrontModel, entityQuery as IEntityQuery<IMenuFront>) as IMenuFront[];
      const menu = sortMenuRecursive((response as any)?.data ?? response);
      return (response as any)?.data
        ? { ...response, data: menu }
        : menu;
    } catch (error) {
      throw formatMongodbError(error, 'MenuFrontService', 'find');
    }
  }

  async findOne(value: any, property: string = '_id'): Promise<IMenuFront | undefined> {
    const record: IMongodbRecord = { property, value };
    try {
      return await this.mongodbRepository.findOne<IMenuFront>(this.MenuFrontModel, record);
    } catch (error) {
      throw formatMongodbError(error, 'MenuFrontService', 'findOne');
    }
  }

  async save(newValue: MenuFrontDto): Promise<IMenuFront | undefined> {
    const roles = await this.resolveRoles(newValue.roles as string[]);
    const value: Partial<IMenuFront> = {
      label: newValue?.label ?? '',
      separator: newValue?.separator ?? false,
      icon: newValue?.icon ?? '',
      routerLink: newValue?.routerLink ?? '',
      items: newValue?.items ?? null,
      roles,
      order: newValue?.order ?? MAGIC_NUMBERS.N_0
    };

    try {
      return await this.mongodbRepository.save<IMenuFront>(this.MenuFrontModel, value);
    } catch (error) {
      throw formatMongodbError(error, 'MenuFrontService', 'save');
    }
  }

  async updateOne(_id: string, updateValue: MenuFrontDto): Promise<IMenuFront | undefined> {
    const record: IMongodbRecord = { property: '_id', value: _id };

    const roles = await this.resolveRoles(updateValue.roles as string[]);
    const value: Partial<IMenuFront> = {
      label: updateValue?.label ?? '',
      separator: updateValue?.separator ?? false,
      icon: updateValue?.icon ?? '',
      routerLink: updateValue?.routerLink ?? '',
      items: updateValue?.items ?? null,
      roles,
      order: updateValue?.order ?? MAGIC_NUMBERS.N_0
    };

    try {
      const result: IMenuFront = await this.mongodbRepository.updateOne<IMenuFront>(this.MenuFrontModel, record, value) as IMenuFront;
      if (!result) {
        throw new NotFoundException(`Front menu not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'MenuFrontService', 'updateOne');
    }
  }

  async updateMany(filter: QueryFilter<IMenuFront>, update: Partial<MenuFrontDto>): Promise<number> {
    try {
      return await this.mongodbRepository.updateMany<IMenuFront>(this.MenuFrontModel, filter, update as Partial<IMenuFront>);
    } catch (error) {
      throw formatMongodbError(error, 'MenuFrontService', 'updateMany');
    }
  }

  async deleteOne(_id: string): Promise<boolean> {
    const record: IMongodbRecord = { property: '_id', value: _id };
    try {
      const result: boolean = await this.mongodbRepository.deleteOne<IMenuFront>(this.MenuFrontModel, record);
      if (!result) {
        throw new NotFoundException(`Permission not found`);
      }

      return result;
    } catch (error) {
      throw formatMongodbError(error, 'MenuFrontService', 'deleteOne');
    }
  }

  async deleteMany(filter: QueryFilter<IMenuFront>): Promise<number> {
    try {
      return await this.mongodbRepository.deleteMany(this.MenuFrontModel, filter);
    } catch (error) {
      throw formatMongodbError(error, 'MenuFrontService', 'deleteMany');
    }
  }

  getModel(): Model<IMenuFront> | undefined {
    try {
      return this.mongodbRepository.getModel(
        MONGODB_CONSTANTS.MENU_FRONT.MODEL,
        MENU_FRONT_SCHEMA,
        MONGODB_CONSTANTS.MENU_FRONT.COLLECTION
      );
    } catch (error) {
      console.error(`[MenuFrontService] getModel -> Error: ${error}`);
      return undefined;
    }
  }

  async setModelIndexes(): Promise<void> {
    try {
      this.mongodbRepository.setModelIndexes(this.MenuFrontModel);
    } catch (error) {
      console.error(`[MenuFrontService] setModelIndexes -> Error: ${error}`);
    }
  }

  private async resolveRoles(ids: string[]): Promise<IRole[] | undefined> {
    if (!ids || ids.length === MAGIC_NUMBERS.N_0) {
      return undefined;
    }

    const dbRoles = await this.rolesService.find({ _id: { $in: ids } } as any) as IRole[];
    if (!dbRoles || dbRoles.length === MAGIC_NUMBERS.N_0) {
      throw new BadRequestException(`One or more roles do not exist`);
    }

    return dbRoles;
  }
}
