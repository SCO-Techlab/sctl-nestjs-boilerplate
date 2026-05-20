
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { HttpException, HttpStatus, ValidationError, ValidationPipe } from '@nestjs/common';

export class SingleErrorValidationPipe extends ValidationPipe {
  constructor() {
    super({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors: string = Object
          .values(validationErrors[MAGIC_NUMBERS.N_0]?.constraints || {})
          .join(';');

        const splitErrors: string[] = errors?.split(';');
        const error: string = splitErrors[splitErrors.length - MAGIC_NUMBERS.N_1];
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      },
    });
  }
}