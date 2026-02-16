import * as fs from 'fs';
import { MAGIC_NUMBERS } from "../constants";

export const formatOrigin = (origin: string): string[] => {
  if (!origin || (origin && origin.length === MAGIC_NUMBERS.N_0)) {
    return ["*"];
  }

  return origin.includes(',') 
    ? origin.split(',') 
    : [origin];
}

export const getCertificates = (certsPath: string, opts?: { certName?: string, keyName?: string }): { cert: any, key: any } => {
  opts = opts || {};
  opts.certName = opts.certName || "fullchain.pem";
  opts.keyName = opts.keyName || "privkey.pem";
  const basepath = certsPath.endsWith('/') ? certsPath : `${certsPath}/`;

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