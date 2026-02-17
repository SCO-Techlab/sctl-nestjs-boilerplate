import { MongodbDocumentDto } from '@shared/dtos';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class PermissionDto extends MongodbDocumentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  extension?: any;
}
