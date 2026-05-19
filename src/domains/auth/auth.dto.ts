import { MAGIC_NUMBERS, REGEX_PATTERNS } from '@shared/constants';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AuthLoginDto {
  @IsNotEmpty()
  @IsString()
  @Matches(REGEX_PATTERNS.EMAIL)
  @MaxLength(MAGIC_NUMBERS.N_255)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(MAGIC_NUMBERS.N_8)
  @MaxLength(MAGIC_NUMBERS.N_64)
  @Matches(REGEX_PATTERNS.PASSWORD)
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

export class AuthRefreshLoginDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class AuthRegisterDto {
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
  role: string;
}

export class AuthPwdRecoveryDto {
  @IsOptional()
  @IsString()
  pwdRecoveryToken?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  pwdRecoveryDate?: Date;
}

export class AuthResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(MAGIC_NUMBERS.N_8)
  @MaxLength(MAGIC_NUMBERS.N_64)
  @Matches(REGEX_PATTERNS.PASSWORD)
  password: string;
}