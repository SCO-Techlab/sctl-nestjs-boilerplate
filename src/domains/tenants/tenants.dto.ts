import { MongodbDocumentDto } from '@core/mongodb';
import { IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString, } from 'class-validator';

export class TenantDto extends MongodbDocumentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsMongoId()
  owner: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  members?: string[];

  @IsOptional()
  @IsString()
  @IsMongoId()
  avatar?: string;
}