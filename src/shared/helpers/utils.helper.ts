import { MAGIC_NUMBERS, REGEX_PATTERNS } from "../constants";

export const attempt = async <T>(fn: () => Promise<T>) => {
  try {
    return {
      data: await fn(),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error,
    };
  }
};

export const titleCase = (str: string, maxWords?: number): string => {
  let counter = MAGIC_NUMBERS.N_0;
  
  return str.replace(REGEX_PATTERNS.WORD_MATCH_REGEX, (txt) => {
    counter++;

    if (maxWords !== undefined && maxWords >= MAGIC_NUMBERS.N_1 && counter > maxWords) {
      return txt;
    }

    return txt.charAt(MAGIC_NUMBERS.N_0).toUpperCase() + txt.substring(MAGIC_NUMBERS.N_1).toLowerCase();
  });
};