import { GridFSBucketReadStream } from "mongodb";

export class IGridfsFile {
  _id?: string;
  filename?: string;
  length?: number;
  uploadDate?: Date;
  metadata?: IGridfsFileMetadata;
  buffer?: IGridfsFileBuffer;
}

export class IGridfsFileMetadata {
  mimetype?: string;
  [key: string]: any;
}

export class IGridfsFileBuffer {
  _id?: string;
  buffer?: Buffer;
  base64?: string;
}

export interface IGridfsGetFileOptions {
  filter?: any;
  includeBuffer?: boolean;
}

export interface IGridfsUploadResponse {
  id: string;
  filename: string;
  metadata: IGridfsFileMetadata;
}

export interface IGridfsDeleteResponse {
  deletedIds: string[];
  errorId?: string;
}

export interface IGridfsFileStream {
  file: IGridfsFile;
  stream: GridFSBucketReadStream;
}