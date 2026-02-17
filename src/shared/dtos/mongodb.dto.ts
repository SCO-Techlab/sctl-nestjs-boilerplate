import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

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