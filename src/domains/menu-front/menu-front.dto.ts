import { MongodbDocumentDto } from '@shared/dtos';
import { IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class MenuFrontDto extends MongodbDocumentDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsBoolean()
  separator?: boolean;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  routerLink?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  items?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  roles?: string[];

  @IsNotEmpty()
  @IsNumber()
  order: number;
}