import { MongodbDocumentDto } from '@core/mongodb';
import { IMenuFront } from '@shared/interfaces';
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
  items?: IMenuFront[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  roles?: string[];

  @IsNotEmpty()
  @IsNumber()
  order: number;
}