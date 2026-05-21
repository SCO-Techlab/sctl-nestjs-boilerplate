import { MAGIC_NUMBERS } from "@core/shared/constants";
import { REGEX_PATTERNS } from "@shared/constants";
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class UpdatePasswordDto {
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