import { Injectable } from "@nestjs/common";
import { MAGIC_NUMBERS } from "@shared/constants";
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class BcryptService {

  constructor() { }

  public async hash(password: string, saltRounds: number = MAGIC_NUMBERS.N_10): Promise<string | undefined> {
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);
      return hash;
    } catch (error) {
      console.error(`[BcryptService] encrypt -> Error: ${JSON.stringify(error)}`);
      return undefined;
    }
  }

  public async compare(value: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(value, hash);
    } catch (error) {
      console.error(`[BcryptService] compare -> Error: ${JSON.stringify(error)}`);
      return false;
    }
  }

  public randomToken(length: number = MAGIC_NUMBERS.N_32): string {
    const safeLength = Math.max(MAGIC_NUMBERS.N_1, length ?? MAGIC_NUMBERS.N_32);

    return crypto
      .randomBytes(Math.ceil(safeLength / MAGIC_NUMBERS.N_2))
      .toString('hex')
      .slice(MAGIC_NUMBERS.N_0, safeLength);
  }

  public randomNumericCode(length: number = MAGIC_NUMBERS.N_6): string {
    const safeLength = Math.max(MAGIC_NUMBERS.N_1, length ?? MAGIC_NUMBERS.N_6);
    const min = MAGIC_NUMBERS.N_10 ** (safeLength - MAGIC_NUMBERS.N_1);
    const max = MAGIC_NUMBERS.N_10 ** safeLength - MAGIC_NUMBERS.N_1;

    return crypto
      .randomInt(min, max)
      .toString();
  }
}
