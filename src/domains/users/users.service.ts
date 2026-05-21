import { GridfsService } from "@core/gridfs";
import { LoggerService } from "@core/logger";
import { formatMongodbError } from "@core/mongodb";
import { BUCKETS, MAGIC_NUMBERS } from "@core/shared/constants";
import { IGridfsFile, IGridfsGetFileOptions } from "@core/shared/interfaces";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { IUser } from "@shared/interfaces";
import { BcryptService, TemplatesService } from "@shared/services";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {

  constructor(
    private readonly loggerService: LoggerService,
    private readonly repository: UsersRepository,
    private readonly templatesService: TemplatesService,
    private readonly gridfsService: GridfsService,
    private readonly bcryptService: BcryptService
  ) { }

  async sendWelcomeEmail(_id: string, lang: string): Promise<boolean> {
    const existUser: IUser = await this.repository.findOne(_id) as IUser;
    if (!existUser) {
      throw new NotFoundException(`User not found`);
    }

    return await this.templatesService.sendWelcomeEmail(existUser, lang);
  }

  async deleteUserAvatar(_id: string): Promise<boolean> {
    const existUser: IUser = await this.repository.findOne(_id) as IUser;
    if (!existUser) {
      throw new NotFoundException(`User not found`);
    }

    try {
      const getPptions: IGridfsGetFileOptions = { filter: { 'metadata.email': existUser?.email } };
      const currentAvatar: IGridfsFile = (await this.gridfsService.getFiles(BUCKETS.AVATARS, getPptions))[MAGIC_NUMBERS.N_0];
      if (currentAvatar) {
        await this.gridfsService.deleteFiles(BUCKETS.AVATARS, [currentAvatar._id as string]);
      }

      await this.repository.Model.updateOne({ _id }, { $unset: { avatar: '' } }).exec();
      return true;
    } catch {
      return false;
    }
  }

  async updatePassword(_id: string, password: string, newPassword: string, validateCurrentPassword: boolean = true): Promise<boolean> {
    const user = await this.repository.findOne(_id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    if (validateCurrentPassword) {
      const isValid = await this.bcryptService.compare(password ?? '', user.password);
      if (!isValid) {
        throw new BadRequestException('Invalid current password');
      }
    }

    const newPassHash = await this.bcryptService.hash(newPassword ?? '');
    try {
      await this.repository.Model.updateOne(
        { _id },
        { $set: { password: newPassHash } }
      );

      return true;
    } catch (error) {
      throw formatMongodbError(error, 'UsersService', 'updatePassword', this.loggerService);
    }
  }
}
