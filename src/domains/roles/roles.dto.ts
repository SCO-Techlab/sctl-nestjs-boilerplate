import { MongodbDocumentDto } from '@shared/dtos';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString, } from 'class-validator';
import { PermissionDto } from '../permissions';

export class RoleDto extends MongodbDocumentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @Type(() => PermissionDto)
  @IsArray()
  permissions?: PermissionDto[];

  @IsOptional()
  @IsObject()
  extension?: any;
}
