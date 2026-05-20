import { MongodbDocumentDto } from '@core/shared/dtos';
import { PERMISSION_TYPE } from '@shared/enums';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
