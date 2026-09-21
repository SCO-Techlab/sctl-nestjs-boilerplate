import { MongodbDocumentDto } from '@core/mongodb';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ResidenceDto extends MongodbDocumentDto {
  @IsNotEmpty()
  @IsMongoId()
  tenant: string;

  @IsNotEmpty()
  @IsString()
  street: string;

  @IsNotEmpty()
  @IsString()
  number: string;

  @IsNotEmpty()
  @IsString()
  door: string;

  @IsOptional()
  @IsString()
  cadastre?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
