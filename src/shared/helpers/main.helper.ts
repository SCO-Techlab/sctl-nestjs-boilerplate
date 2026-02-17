import * as fs from 'fs';
import { MAGIC_NUMBERS, MAGIC_STRINGS } from "../constants";

export const formatOrigin = (origin: string): string[] => {
  if (!origin || origin.length === MAGIC_NUMBERS.N_0) {
    return [MAGIC_STRINGS.ASTERISK];
  }

  return origin.includes(MAGIC_STRINGS.COMMA)
    ? origin.split(MAGIC_STRINGS.COMMA)
    : [origin];
}

export const getCertificates = (certsPath: string, opts?: { certName?: string, keyName?: string }): { cert: any, key: any } => {
  opts = opts || {};
  opts.certName = opts.certName || MAGIC_STRINGS.FULLCHAIN_PEM;
  opts.keyName = opts.keyName || MAGIC_STRINGS.PRIVKEY_PEM;

  const basepath = certsPath.endsWith(MAGIC_STRINGS.SLASH)
    ? certsPath
    : `${certsPath}${MAGIC_STRINGS.SLASH}`;

  if (!fs.existsSync(basepath)) {
    return { cert: undefined, key: undefined };
  }

  if (!fs.existsSync(`${basepath}${opts.certName}`)) {
    return { cert: undefined, key: undefined };
  }

  if (!fs.existsSync(`${basepath}${opts.keyName}`)) {
    return { cert: undefined, key: undefined };
  }

  try {
    const cert = fs.readFileSync(`${basepath}${opts.certName}`);
    const key = fs.readFileSync(`${basepath}${opts.keyName}`);
    return { cert, key };
  } catch (err) {
    return { cert: undefined, key: undefined };
  }
}