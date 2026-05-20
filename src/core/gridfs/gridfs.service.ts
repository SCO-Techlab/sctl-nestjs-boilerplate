import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { MAGIC_NUMBERS } from "@shared/constants";
import { PROVIDER_CONFIG } from "@shared/helpers";
import { GridFSBucket, ObjectId } from "mongodb";
import { Connection } from "mongoose";
import type { IGridfsConfig } from "./gridfs.config";
import { IGridfsDeleteResponse, IGridfsFile, IGridfsFileStream, IGridfsGetFileOptions, IGridfsUploadResponse } from "./gridfs.interface";
import { GridfsManagerService } from "./gridfs.manager";
import { GridfsUtilsService } from "./gridfs.utils.service";

@Injectable()
export class GridfsService {

  constructor(
    @Inject(PROVIDER_CONFIG) private config: IGridfsConfig,
    private readonly manager: GridfsManagerService,
    private readonly utils: GridfsUtilsService
  ) { }

  public async connectBuckets(connection: Connection): Promise<void> {
    if (!this.config?.buckets || this.config?.buckets?.length === MAGIC_NUMBERS.N_0 || !connection) {
      return;
    }

    for (const bucketConfig of this.config.buckets) {
      try {
        const bucketName: string = bucketConfig.name;
        const bucket = new GridFSBucket(connection.db as any, { bucketName });
        this.manager.set(bucketConfig.name, bucket);
        await this.utils.createIndexes(bucketConfig, connection);
        console.log(`[GridfsService] connectBuckets -> Bucket '${bucketConfig.name}' -> Connected`);
      } catch (error) {
        console.error(`[GridfsService] connectBuckets -> Bucket '${bucketConfig.name}' -> Error: ${error}`);
      }
    }
  }

  public getFileStream(bucketName: string, file: IGridfsFile): IGridfsFileStream {
    if (!file?._id) {
      throw new BadRequestException(`[Gridfs] File required`);
    }

    const bucket = this.manager.get(bucketName);
    if (!bucket) {
      throw new NotFoundException(`[Gridfs] Bucket '${bucketName}' not found`);
    }

    const stream = bucket.openDownloadStream(new ObjectId(file._id as string));
    return { file, stream };
  }

  public async uploadFiles(bucketName: string, files: Express.Multer.File[], metadata?: any): Promise<IGridfsUploadResponse[]> {
    const bucket = this.manager.get(bucketName);
    if (!bucket) {
      throw new NotFoundException(`[Gridfs] Bucket '${bucketName}' not found`);
    }

    if (!files || files?.length === MAGIC_NUMBERS.N_0) {
      throw new BadRequestException(`[Gridfs] Files required`);
    }

    const uploaded: IGridfsUploadResponse[] = [];
    for (const file of files) {
      const fileMetadata = {
        ...(metadata ?? {}),
        mimetype: file.mimetype ?? "application/octet-stream"
      };

      const stream = bucket.openUploadStream(
        file.originalname,
        { metadata: fileMetadata }
      );

      const fileId = await new Promise<ObjectId>((resolve, reject) => {
        stream.on("finish", () => resolve(stream.id));
        stream.on("error", reject);
        stream.end(file.buffer);
      });

      uploaded.push({
        id: fileId.toString(),
        filename: file.originalname,
        metadata: fileMetadata
      });
    }

    return uploaded;
  }

  public async getFiles(bucketName: string, options: IGridfsGetFileOptions = {}): Promise<IGridfsFile[]> {
    const bucket = this.manager.get(bucketName);
    if (!bucket) {
      throw new NotFoundException(`[Gridfs] Bucket '${bucketName}' not found`);
    }

    const filter = this.utils.formatFilter(options.filter);
    const files = await bucket.find(filter).toArray();
    const result = files.map(f => this.utils.convertFile(f));

    if (options.includeBuffer) {
      for (const file of result) {
        const stream = bucket.openDownloadStream(new ObjectId(file._id));
        file.buffer = await this.utils.readStreamToBuffer(file, stream);
      }
    }

    return result;
  }

  public async deleteFiles(bucketName: string, ids: string[]): Promise<IGridfsDeleteResponse> {
    const bucket = this.manager.get(bucketName);
    if (!bucket) {
      throw new NotFoundException(`[Gridfs] Bucket '${bucketName}' not found`);
    }

    const response: IGridfsDeleteResponse = { deletedIds: [] };
    for (const id of ids) {
      try {
        await bucket.delete(new ObjectId(id));
        response.deletedIds.push(id);
      } catch {
        response.errorId = id;
        break;
      }
    }

    return response;
  }
}