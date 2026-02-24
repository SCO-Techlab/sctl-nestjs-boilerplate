import { BadRequestException, ConflictException, HttpException, InternalServerErrorException } from "@nestjs/common";
import { MAGIC_NUMBERS, MAGIC_STRINGS } from "@shared/constants";

export const formatMongodbError = (error: any, service: string, method: string): any => {
  if (error instanceof HttpException) {
    return error;
  }

  const formatedService: string = `${MAGIC_STRINGS.SQUARE_BRACKET_OPEN}${service}${MAGIC_STRINGS.SQUARE_BRACKET_CLOSE}`;
  console.error(`${formatedService} ${method} ${MAGIC_STRINGS.ARROW_RIGHT} ${MAGIC_STRINGS.ERROR}${MAGIC_STRINGS.COLON} ${error}`);

  if (error?.code === MAGIC_NUMBERS.N_11000 && !error?.codeName) {
    return new ConflictException(formatDuplicatedKeyError(error));
  }

  if (error?.code === MAGIC_NUMBERS.N_11000 && error?.codeName) {
    return new ConflictException(formatDuplicatedKeyErrorWithCodeName(error));
  }

  if (error?.name === 'CastError') {
    return new BadRequestException(formatCastError(error));
  }

  return new InternalServerErrorException(`Unexpected error while ${method} in ${service}`);
}

const formatDuplicatedKeyError = (error: any): string => {
  let message: string = error.errorResponse.errmsg;
  message = message.replace(`${MAGIC_STRINGS.E.toUpperCase()}${MAGIC_NUMBERS.N_11000}`, MAGIC_STRINGS.EMPTY_STRING);
  message = message.substring(MAGIC_NUMBERS.N_1);
  message = `${message.charAt(MAGIC_NUMBERS.N_0).toUpperCase()}${message.substring(MAGIC_NUMBERS.N_1)}`;

  const splitMessage: string[] = message.split(MAGIC_STRINGS.COLON);
  message = splitMessage[MAGIC_NUMBERS.N_0];

  const keyValues: string[] = Object.keys(error.errorResponse.keyValue) || [];
  if (keyValues?.length > MAGIC_NUMBERS.N_0) {
    message += fillKeyValues(keyValues, error);
  }

  return message;
}

const formatDuplicatedKeyErrorWithCodeName = (error: any): string => {
  let message: string = MAGIC_STRINGS.DUPLICATE_KEY_ERROR_COLLECTION;

  const keyValues: string[] = Object.keys(error.errorResponse.keyValue) || [];
  if (keyValues?.length > MAGIC_NUMBERS.N_0) {
    message += fillKeyValues(keyValues, error);
  }

  return message;
}

const formatCastError = (error: any): string => {
  let message: string = error.message.split(MAGIC_STRINGS.QUOTE)[MAGIC_NUMBERS.N_0];
  message = message + `${error.value} ${MAGIC_STRINGS.ROUND_BRACKET_OPEN}${error.path}${MAGIC_STRINGS.ROUND_BRACKET_CLOSE}`;
  return message;
}

const fillKeyValues = (keyValues: string[], error: any): string => {
  if (keyValues?.length <= MAGIC_NUMBERS.N_0) {
    return MAGIC_STRINGS.EMPTY_STRING;
  }

  let message: string = `${MAGIC_STRINGS.SPACE}${MAGIC_STRINGS.ROUND_BRACKET_OPEN}`;
  keyValues.forEach((key: string) => message += `${key} ${MAGIC_STRINGS.ARROW_RIGHT} ${error.errorResponse.keyValue[key]}${MAGIC_STRINGS.COMMA} `);
  message = message.substring(MAGIC_NUMBERS.N_0, message.length - MAGIC_NUMBERS.N_2);
  message += `${MAGIC_STRINGS.ROUND_BRACKET_CLOSE}`;
  return message;
}