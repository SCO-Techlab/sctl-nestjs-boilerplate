import { BadRequestException, ConflictException, HttpException, InternalServerErrorException } from "@nestjs/common";
import { MAGIC_NUMBERS, MAGIC_STRINGS } from "../constants";

export const formatMongodbError = (error: any, service: string, method: string, verbose: boolean = false): any => {
  if (error instanceof HttpException) {
    return error;
  }

  if (verbose) {
    console.error(`[${service}] ${method} -> Error: ${error}`);
  }

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
  message = message.replace(`E${MAGIC_NUMBERS.N_11000}`, MAGIC_STRINGS.EMPTY_STRING);
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
  let message: string = `Duplicate key error collection`;

  const keyValues: string[] = Object.keys(error.errorResponse.keyValue) || [];
  if (keyValues?.length > MAGIC_NUMBERS.N_0) {
    message += fillKeyValues(keyValues, error);
  }

  return message;
}

const formatCastError = (error: any): string => {
  let message: string = error.message.split(MAGIC_STRINGS.QUOTE)[MAGIC_NUMBERS.N_0];
  message = message + `${error.value} (${error.path})`;
  return message;
}

const fillKeyValues = (keyValues: string[], error: any): string => {
  if (keyValues?.length <= MAGIC_NUMBERS.N_0) {
    return '';
  }

  let message: string = ` (`;
  keyValues.forEach((key: string) => message += `${key} -> ${error.errorResponse.keyValue[key]}, `);
  message = message.substring(MAGIC_NUMBERS.N_0, message.length - MAGIC_NUMBERS.N_2);
  message += `)`;
  return message;
}