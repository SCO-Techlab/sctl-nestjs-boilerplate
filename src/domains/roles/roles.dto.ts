import { MongodbDocumentDto } from '@shared/dtos';
import { ArrayNotEmpty, IsArray, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString, } from 'class-validator';

export class RoleDto extends MongodbDocumentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsObject()
  extension?: any;
}
