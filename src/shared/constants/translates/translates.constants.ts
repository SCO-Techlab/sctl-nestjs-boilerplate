import { ITranslates } from "@shared/interfaces";
import { EN_TRANSLATES, ES_TRANSLATES } from "./i18n";

export const DEFAULT_LANG: string = 'en';

export const TRANSLATES: { [key: string]: ITranslates } = {
  ['en']: EN_TRANSLATES,
  ['es']: ES_TRANSLATES,
};