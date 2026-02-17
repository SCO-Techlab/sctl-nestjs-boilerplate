
import { RoleDto } from '@domains/roles';
import { MAGIC_NUMBERS, REGEX_PATTERNS } from '@shared/constants';
import { MongodbDocumentDto } from '@shared/dtos';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNotEmpty, IsObject, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UserDto extends MongodbDocumentDto {
  @IsNotEmpty()
  @IsString()
  @Matches(REGEX_PATTERNS.EMAIL)
  @MaxLength(MAGIC_NUMBERS.N_255)
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(MAGIC_NUMBERS.N_8)
  @MaxLength(MAGIC_NUMBERS.N_64)
  @Matches(REGEX_PATTERNS.PASSWORD)
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(MAGIC_NUMBERS.N_8)
  @MaxLength(MAGIC_NUMBERS.N_64)
  @Matches(REGEX_PATTERNS.PASSWORD)
  newPassword?: string;

  @IsOptional()
  @IsString()
  @MaxLength(MAGIC_NUMBERS.N_32)
  userName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(MAGIC_NUMBERS.N_255)
  personalName?: string;

  @IsNotEmpty()
  @IsBoolean()
  active: boolean;

  @IsOptional()
  @IsBoolean()
  emailConfirmed?: boolean;

  @IsNotEmpty()
  @Type(() => RoleDto)
  @IsObject()
  role: RoleDto;

  @IsOptional()
  @IsString()
  pwdRecoveryToken?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  pwdRecoveryDate?: Date;

  @IsOptional()
  @IsObject()
  extension?: any;
}

