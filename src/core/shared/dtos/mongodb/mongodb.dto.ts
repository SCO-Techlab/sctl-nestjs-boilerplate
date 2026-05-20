import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDate, IsMongoId, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class MongodbDocumentDto {
  @IsOptional()
  @IsString()
  @IsMongoId()
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

export class MongodbBulkUpdateDto<T> {
  @IsArray()
  @IsNotEmpty()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  _ids: string[];

  @IsObject()
  @IsNotEmpty()
  data: Partial<T>;
}

export class MongodbBulkDeleteDto {
  @IsArray()
  @IsNotEmpty()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  _ids: string[];
}