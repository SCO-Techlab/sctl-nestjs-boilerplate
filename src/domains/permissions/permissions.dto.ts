import { MongodbDocumentDto } from '@core/mongodb';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PERMISSION_TYPE } from './permissions.enum';

export class PermissionCreateDto extends MongodbDocumentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(PERMISSION_TYPE)
  type: PERMISSION_TYPE;
}

export class PermissionUpdateDto extends MongodbDocumentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(PERMISSION_TYPE)
  type?: PERMISSION_TYPE;
}
