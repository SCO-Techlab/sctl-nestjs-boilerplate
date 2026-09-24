import { MongodbDocumentDto } from '@core/mongodb';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class RoomDto extends MongodbDocumentDto {
  @IsNotEmpty()
  @IsMongoId()
  tenant: string;

  @IsNotEmpty()
  @IsMongoId()
  residence: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  beds: number;

  @IsOptional()
  @IsString({ each: true })
  images?: string[];
}
