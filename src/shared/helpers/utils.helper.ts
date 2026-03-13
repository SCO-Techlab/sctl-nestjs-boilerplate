import { IMenuFront } from "@domains/menu-front";
import { MAGIC_NUMBERS } from "@shared/constants";

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

export const getFrontendUrl = (httpsEnabled: boolean, host: string, port: number, extraPath?: string): string => {
  const protocol = httpsEnabled 
    ? 'https' 
    : 'http';
    
  const url: string = `${protocol}://${host}:${port}`;
  
  return extraPath 
    ? `${url}/${extraPath}` 
    : url;
}

export const parseDateUnits = (dateUnit: string): number => {
  const match = dateUnit.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error('Invalid date unit format (1d, 2h, 3m, 4s...)');
  };

  const value = parseInt(match[MAGIC_NUMBERS.N_1], MAGIC_NUMBERS.N_10);
  const unit = match[MAGIC_NUMBERS.N_2];

  const multipliers: Record<string, number> = {
    s: MAGIC_NUMBERS.N_1000,
    m: MAGIC_NUMBERS.N_1000 * MAGIC_NUMBERS.N_60,
    h: MAGIC_NUMBERS.N_1000 * MAGIC_NUMBERS.N_60 * MAGIC_NUMBERS.N_60,
    d: MAGIC_NUMBERS.N_1000 * MAGIC_NUMBERS.N_60 * MAGIC_NUMBERS.N_60 * MAGIC_NUMBERS.N_24,
  };

  return value * multipliers[unit];
}

export const sortMenuRecursive = (menu: IMenuFront[]): IMenuFront[] => {
    if (!menu || menu.length === MAGIC_NUMBERS.N_0) {
      return [];
    }

    menu.sort(
      (a, b) =>
        (a?.order ?? MAGIC_NUMBERS.N_0) -
        (b?.order ?? MAGIC_NUMBERS.N_0)
    );

    for (const item of menu) {
      if (item.items && item.items.length > MAGIC_NUMBERS.N_0) {
        item.items = sortMenuRecursive(item.items);
      }
    }

    return menu;
  }