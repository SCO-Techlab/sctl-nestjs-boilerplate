import { MongodbDocumentDto } from '@shared/dtos';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { PERMISSION_TYPE } from './permissions.enum';

export class PermissionCreateDto extends MongodbDocumentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(PERMISSION_TYPE)
  type: PERMISSION_TYPE;

  @IsOptional()
  @IsObject()
  extension?: any;
}

export class PermissionUpdateDto extends MongodbDocumentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(PERMISSION_TYPE)
  type?: PERMISSION_TYPE;

  @IsOptional()
  @IsObject()
  extension?: any;
}
