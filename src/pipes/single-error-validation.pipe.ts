import { HttpException, HttpStatus, ValidationError, ValidationPipe } from '@nestjs/common';
import { MAGIC_NUMBERS, MAGIC_STRINGS } from '@shared/constants';

export class SingleErrorValidationPipe extends ValidationPipe {
  constructor() {
    super({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors: string = Object
          .values(validationErrors[MAGIC_NUMBERS.N_0]?.constraints || {})
          .join(MAGIC_STRINGS.SEMICOLON);

        const splitErrors: string[] = errors?.split(MAGIC_STRINGS.SEMICOLON);
        const error: string = splitErrors[splitErrors.length - MAGIC_NUMBERS.N_1];
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      },
    });
  }
}