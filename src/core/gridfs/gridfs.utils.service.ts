import { MAGIC_NUMBERS } from "@core/shared/constants";
import { IGridfsBucketConfig, IGridfsFile, IGridfsFileBuffer, IGridfsFileMetadata } from "@core/shared/interfaces";
import { Injectable } from "@nestjs/common";
import { GridFSBucketReadStream, GridFSFile, ObjectId } from "mongodb";
import { Connection } from "mongoose";

@Injectable()
export class GridfsUtilsService {

  public convertFile(file: GridFSFile): IGridfsFile {
    const metadata: IGridfsFileMetadata = {
      mimetype: file.metadata?.mimetype,
      ...Object.assign(file.metadata ?? {})
    };

    return {
      _id: file._id.toString(),
      filename: file.filename,
      length: file.length,
      uploadDate: file.uploadDate,
      metadata
    };
  }

  public formatFilter(filter: any): any {
    if (!filter) {
      return {};
    }

    if (filter._id) {
      filter._id = new ObjectId(filter._id);
    }

    return filter;
  }

  public async readStreamToBuffer(file: IGridfsFile, stream: GridFSBucketReadStream): Promise<IGridfsFileBuffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          _id: file._id,
          buffer,
          base64: `data:${file.metadata?.mimetype};base64,${buffer.toString("base64")}`
        });
      });
    });
  }

  public async createIndexes(bucketConfig: IGridfsBucketConfig, connection: Connection): Promise<void> {
    if (!bucketConfig.indexes || bucketConfig.indexes?.length === MAGIC_NUMBERS.N_0) {
      return;
    }

    const collection = connection.db?.collection(`${bucketConfig.name}.files`);
    if (!collection) {
      return;
    }

    for (const index of bucketConfig.indexes) {
      const fields: any = {};

      if (index.filename) {
        fields.filename = MAGIC_NUMBERS.N_1;
      }

      if (index.metadata) {
        for (const prop of index.metadata) {
          fields[`metadata.${prop}`] = MAGIC_NUMBERS.N_1;
        }
      }

      if (Object.keys(fields).length > MAGIC_NUMBERS.N_0) {
        await collection?.createIndex(fields, { unique: true });
      }
    }
  }
}