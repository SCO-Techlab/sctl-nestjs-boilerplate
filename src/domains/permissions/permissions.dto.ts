import { MongodbDocumentDto } from '@core/shared/dtos';
import { PERMISSION_TYPE } from '@shared/enums';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class PermissionDto extends MongodbDocumentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(PERMISSION_TYPE)
  type: PERMISSION_TYPE;
}