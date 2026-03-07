
import { MAGIC_NUMBERS } from '@shared/constants';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserInfoDto {
  @IsOptional()
  @IsString()
  @MaxLength(MAGIC_NUMBERS.N_32)
  userName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(MAGIC_NUMBERS.N_255)
  personalName?: string;
}