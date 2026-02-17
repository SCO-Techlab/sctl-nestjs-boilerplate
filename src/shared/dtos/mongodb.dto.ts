import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDate, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class MongodbDocumentDto {
  @IsOptional()
  @IsString()
  _id?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedAt?: Date;

  @IsOptional()
  @IsNumber()
  __v?: number;
}

export class MongodbBulkUpdateDto {
  @IsArray()
  @IsNotEmpty()
  @ArrayNotEmpty()
  _ids: string[];

  @IsObject()
  @IsNotEmpty()
  data: Partial<any>;
}

export class MongodbBulkDeleteDto {
  @IsArray()
  @IsNotEmpty()
  @ArrayNotEmpty()
  _ids: string[];
}