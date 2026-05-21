import { MAGIC_NUMBERS } from '@core/shared/constants';
import { MongodbDocumentDto } from '@core/shared/dtos';
import { REGEX_PATTERNS } from '@shared/constants';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UserDto extends MongodbDocumentDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(MAGIC_NUMBERS.N_255)
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(REGEX_PATTERNS.PASSWORD)
  @MinLength(MAGIC_NUMBERS.N_8)
  @MaxLength(MAGIC_NUMBERS.N_64)
  password: string;

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

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  emailConfirmedAt?: Date;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  role: string;

  @IsOptional()
  @IsString()
  @MaxLength(MAGIC_NUMBERS.N_255)
  pwdRecoveryToken?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  pwdRecoveryDate?: Date;

  @IsOptional()
  @IsString()
  @IsMongoId()
  avatar?: string;
}

export class UserPasswordUpdateDto {
  @IsNotEmpty()
  @IsString()
  @Matches(REGEX_PATTERNS.PASSWORD)
  @MinLength(MAGIC_NUMBERS.N_8)
  @MaxLength(MAGIC_NUMBERS.N_64)
  password: string;

  @IsNotEmpty()
  @IsString()
  @Matches(REGEX_PATTERNS.PASSWORD)
  @MinLength(MAGIC_NUMBERS.N_8)
  @MaxLength(MAGIC_NUMBERS.N_64)
  newPassword: string;
}