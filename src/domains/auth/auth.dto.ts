import { UserCreateDto } from '@domains/users';
import { MAGIC_NUMBERS, REGEX_PATTERNS } from '@shared/constants';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsObject, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

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
}

export class AuthRegisterDto {
  @IsNotEmpty()
  @Type(() => UserCreateDto)
  @IsObject()
  user: UserCreateDto;
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
  @MinLength(MAGIC_NUMBERS.N_8)
  @MaxLength(MAGIC_NUMBERS.N_64)
  @Matches(REGEX_PATTERNS.PASSWORD)
  password: string;
}