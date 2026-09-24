import { BUCKETS, GridfsService, IGridfsFile, IGridfsFileStream, IGridfsGetFileOptions, IGridfsUploadResponse } from '@core/gridfs';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { FILE_SIZES } from '@shared/constants';
import { formatObjectId } from '@shared/helpers';
import { IResidence } from '@shared/interfaces';
import { ResidencesRepository } from './residences.repository';

@Injectable()
export class ResidencesService {

  constructor(
    private readonly residencesRepository: ResidencesRepository,
    private readonly gridfsService: GridfsService,
  ) { }

  async addResidenceImages(residenceId: string, tenantId: string, files: Express.Multer.File[]): Promise<IResidence> {
    const residence: IResidence = await this.residencesRepository.findOne(residenceId, '_id') as IResidence;
    if (!residence) {
      throw new NotFoundException('Residence not found');
    }

    if (formatObjectId(residence.tenant?._id as string) !== formatObjectId(tenantId)) {
      throw new UnauthorizedException();
    }

    if (!files || files.length === MAGIC_NUMBERS.N_0) {
      throw new BadRequestException('Files required');
    }

    if (files.length > MAGIC_NUMBERS.N_5) {
      throw new BadRequestException('Maximum of 5 images per residence');
    }

    const currentImages = Array.isArray(residence.images) ? residence.images : [];
    if (currentImages.length + files.length > MAGIC_NUMBERS.N_5) {
      throw new BadRequestException('Maximum of 5 images per residence');
    }

    for (const file of files) {
      if (!file) {
        throw new BadRequestException('Invalid file');
      }

      if (file.size > FILE_SIZES.MB_5) {
        throw new BadRequestException('File size too large (max 5MB)');
      }
    }

    const uploadedFiles: IGridfsUploadResponse[] = await this.gridfsService.uploadFiles(BUCKETS.RESIDENCES_IMAGES, files, {
      tenantId,
      residenceId: residenceId,
    });

    if (!uploadedFiles?.length) {
      throw new ConflictException('Error uploading residence images');
    }

    const uploadedImageIds = uploadedFiles.map(file => file.id);
    const imageIds = currentImages.map(image => typeof image === 'string' ? image : (image as any)._id ?? image);

    const updatedResidence: IResidence = await this.residencesRepository.updateOne(residenceId, {
      images: [...imageIds, ...uploadedImageIds],
    } as Partial<IResidence>) as IResidence;

    if (!updatedResidence) {
      throw new NotFoundException('Error updating residence');
    }

    return updatedResidence;
  }

  async deleteResidenceImage(residenceId: string, tenantId: string, imageId: string): Promise<IResidence> {
    const residence: IResidence = await this.residencesRepository.findOne(residenceId, '_id') as IResidence;
    if (!residence) {
      throw new NotFoundException('Residence not found');
    }

    if (formatObjectId(residence.tenant?._id as string) !== formatObjectId(tenantId)) {
      throw new UnauthorizedException();
    }

    const currentImages = Array.isArray(residence.images) ? residence.images : [];
    const exists = currentImages.some((image) => {
      const currentImageId = typeof image === 'string' ? image : (image as any)._id as string | undefined;
      return currentImageId && formatObjectId(currentImageId) === formatObjectId(imageId);
    });

    if (!exists) {
      throw new NotFoundException('Image not found');
    }

    const getOptions: IGridfsGetFileOptions = { filter: { _id: imageId } };
    const image: IGridfsFile = (await this.gridfsService.getFiles(BUCKETS.RESIDENCES_IMAGES, getOptions))[MAGIC_NUMBERS.N_0];
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.gridfsService.deleteFiles(BUCKETS.RESIDENCES_IMAGES, [imageId]);

    const remainingImages = currentImages.filter((image) => {
      const currentImageId = typeof image === 'string' ? image : (image as any)._id as string | undefined;
      return !currentImageId || formatObjectId(currentImageId) !== formatObjectId(imageId);
    });

    const updatedResidence: IResidence = await this.residencesRepository.updateOne(residenceId, {
      images: remainingImages,
    } as Partial<IResidence>) as IResidence;

    if (!updatedResidence) {
      throw new NotFoundException('Error updating residence');
    }

    return updatedResidence;
  }

  async getResidenceImage(residenceId: string, tenantId: string, imageId: string): Promise<IGridfsFileStream> {
    const residence: IResidence = await this.residencesRepository.findOne(residenceId, '_id') as IResidence;
    if (!residence) {
      throw new NotFoundException('Residence not found');
    }

    if (formatObjectId(residence.tenant?._id as string) !== formatObjectId(tenantId)) {
      throw new UnauthorizedException();
    }

    const getOptions: IGridfsGetFileOptions = { filter: { _id: imageId } };
    const image: IGridfsFile = (await this.gridfsService.getFiles(BUCKETS.RESIDENCES_IMAGES, getOptions))[MAGIC_NUMBERS.N_0];
    if (!image || image.metadata?.residenceId !== residenceId || image.metadata?.tenantId !== tenantId) {
      throw new NotFoundException('Image not found');
    }

    const gridfsFileStream: IGridfsFileStream = this.gridfsService.getFileStream(BUCKETS.RESIDENCES_IMAGES, image);
    if (!gridfsFileStream) {
      throw new NotFoundException('Image not found');
    }

    return gridfsFileStream;
  }
}
