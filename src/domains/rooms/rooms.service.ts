import { BUCKETS, GridfsService, IGridfsFile, IGridfsFileStream, IGridfsGetFileOptions, IGridfsUploadResponse } from '@core/gridfs';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { FILE_SIZES } from '@shared/constants';
import { formatObjectId } from '@shared/helpers';
import { IRoom } from '@shared/interfaces';
import { RoomsRepository } from './rooms.repository';

@Injectable()
export class RoomsService {

  constructor(
    private readonly roomsRepository: RoomsRepository,
    private readonly gridfsService: GridfsService,
  ) { }

  async addRoomImages(roomId: string, tenantId: string, files: Express.Multer.File[]): Promise<IRoom> {
    const room: IRoom = await this.roomsRepository.findOne(roomId, '_id') as IRoom;
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (formatObjectId(String(room.tenant?._id ?? room.tenant)) !== formatObjectId(tenantId)) {
      throw new UnauthorizedException();
    }

    if (!files || files.length === MAGIC_NUMBERS.N_0) {
      throw new BadRequestException('Files required');
    }

    if (files.length > MAGIC_NUMBERS.N_5) {
      throw new BadRequestException('Maximum of 5 images per room');
    }

    const currentImages = Array.isArray(room.images) ? room.images : [];
    if (currentImages.length + files.length > MAGIC_NUMBERS.N_5) {
      throw new BadRequestException('Maximum of 5 images per room');
    }

    for (const file of files) {
      if (!file) {
        throw new BadRequestException('Invalid file');
      }

      if (file.size > FILE_SIZES.MB_5) {
        throw new BadRequestException('File size too large (max 5MB)');
      }
    }

    const uploadedFiles: IGridfsUploadResponse[] = await this.gridfsService.uploadFiles(BUCKETS.ROOMS_IMAGES, files, {
      tenantId,
      roomId,
    });

    if (!uploadedFiles?.length) {
      throw new ConflictException('Error uploading room images');
    }

    const uploadedImageIds = uploadedFiles.map(file => file.id);
    const imageIds = currentImages.map(image => typeof image === 'string' ? image : (image as any)._id ?? image);

    const updatedRoom: IRoom = await this.roomsRepository.updateOne(roomId, {
      images: [...imageIds, ...uploadedImageIds],
    } as Partial<IRoom>) as IRoom;

    if (!updatedRoom) {
      throw new NotFoundException('Error updating room');
    }

    return updatedRoom;
  }

  async deleteRoomImage(roomId: string, tenantId: string, imageId: string): Promise<IRoom> {
    const room: IRoom = await this.roomsRepository.findOne(roomId, '_id') as IRoom;
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (formatObjectId(String(room.tenant?._id ?? room.tenant)) !== formatObjectId(tenantId)) {
      throw new UnauthorizedException();
    }

    const currentImages = Array.isArray(room.images) ? room.images : [];
    const exists = currentImages.some((image) => {
      const currentImageId = typeof image === 'string' ? image : (image as any)._id as string | undefined;
      return currentImageId && formatObjectId(currentImageId) === formatObjectId(imageId);
    });

    if (!exists) {
      throw new NotFoundException('Image not found');
    }

    const getOptions: IGridfsGetFileOptions = { filter: { _id: imageId } };
    const image: IGridfsFile = (await this.gridfsService.getFiles(BUCKETS.ROOMS_IMAGES, getOptions))[MAGIC_NUMBERS.N_0];
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.gridfsService.deleteFiles(BUCKETS.ROOMS_IMAGES, [imageId]);

    const remainingImages = currentImages.filter((image) => {
      const currentImageId = typeof image === 'string' ? image : (image as any)._id as string | undefined;
      return !currentImageId || formatObjectId(currentImageId) !== formatObjectId(imageId);
    });

    const updatedRoom: IRoom = await this.roomsRepository.updateOne(roomId, {
      images: remainingImages,
    } as Partial<IRoom>) as IRoom;

    if (!updatedRoom) {
      throw new NotFoundException('Error updating room');
    }

    return updatedRoom;
  }

  async getRoomImage(roomId: string, tenantId: string, imageId: string): Promise<IGridfsFileStream> {
    const room: IRoom = await this.roomsRepository.findOne(roomId, '_id') as IRoom;
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (formatObjectId(String(room.tenant?._id ?? room.tenant)) !== formatObjectId(tenantId)) {
      throw new UnauthorizedException();
    }

    const getOptions: IGridfsGetFileOptions = { filter: { _id: imageId } };
    const image: IGridfsFile = (await this.gridfsService.getFiles(BUCKETS.ROOMS_IMAGES, getOptions))[MAGIC_NUMBERS.N_0];
    if (!image || image.metadata?.roomId !== roomId || image.metadata?.tenantId !== tenantId) {
      throw new NotFoundException('Image not found');
    }

    const gridfsFileStream: IGridfsFileStream = this.gridfsService.getFileStream(BUCKETS.ROOMS_IMAGES, image);
    if (!gridfsFileStream) {
      throw new NotFoundException('Image not found');
    }

    return gridfsFileStream;
  }
}
