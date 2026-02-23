import { ITranslates } from "@shared/interfaces";
import { MAGIC_STRINGS } from "../magic-strings.constants";
import { EN_TRANSLATES, ES_TRANSLATES } from "./i18n";

export const DEFAULT_LANG: string = MAGIC_STRINGS.EN;

export const TRANSLATES: { [key: string]: ITranslates } = {
  [MAGIC_STRINGS.EN]: EN_TRANSLATES,
  [MAGIC_STRINGS.ES]: ES_TRANSLATES
};