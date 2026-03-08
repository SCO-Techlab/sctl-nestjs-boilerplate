
import { MAGIC_NUMBERS, REGEX_PATTERNS } from '@shared/constants';
import { MongodbDocumentDto } from '@shared/dtos';
import { IsBoolean, IsDate, IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UserCreateDto extends MongodbDocumentDto {
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

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  role: string;
}

export class UserUpdateDto extends MongodbDocumentDto {
  @IsOptional()
  @IsString()
  @MaxLength(MAGIC_NUMBERS.N_255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(MAGIC_NUMBERS.N_32)
  userName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(MAGIC_NUMBERS.N_255)
  personalName?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  emailConfirmed?: boolean;

  @IsOptional()
  @IsDate()
  emailConfirmedAt?: Date;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  role?: string;

  @IsOptional()
  @IsDate()
  pwdRecoveryDate?: Date | null;

  @IsOptional()
  @IsString()
  pwdRecoveryToken?: string | null;

  @IsOptional()
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