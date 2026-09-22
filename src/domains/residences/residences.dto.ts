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

  @IsOptional()
  @IsString()
  flat?: string;

  @IsOptional()
  @IsString()
  door?: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  province: string;

  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @IsOptional()
  @IsString()
  cadastre?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
