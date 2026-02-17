import { MongodbDocumentDto } from '@shared/dtos';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class PermissionCreateDto extends MongodbDocumentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  extension?: any;
}

export class PermissionUpdateDto extends MongodbDocumentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  extension?: any;
}
