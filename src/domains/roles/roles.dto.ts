import { MongodbDocumentDto } from '@core/mongodb';
import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString, } from 'class-validator';

export class RoleCreateDto extends MongodbDocumentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  permissions?: string[];
}

export class RoleUpdateDto extends MongodbDocumentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  permissions?: string[];
}