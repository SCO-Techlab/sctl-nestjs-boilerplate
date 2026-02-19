export const REGEX_PATTERNS = {
  EMAIL: /.+@.+\..+/,
  PASSWORD: /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
  WORD_MATCH_REGEX: /\w\S*/g
}