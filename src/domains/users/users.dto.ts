
import { MAGIC_NUMBERS, REGEX_PATTERNS } from '@shared/constants';
import { MongodbDocumentDto } from '@shared/dtos';
import { IsBoolean, IsDate, IsEmail, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

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

  @IsOptional()
  @IsBoolean()
  emailConfirmed?: boolean;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  role: string;

  @IsOptional()
  @IsObject()
  extension?: any;
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

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  role?: string;

  @IsOptional()
  @IsObject()
  extension?: any;

  @IsOptional()
  @IsDate()
  pwdRecoveryDate?: Date | null;

  @IsOptional()
  @IsString()
  pwdRecoveryToken?: string | null;
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