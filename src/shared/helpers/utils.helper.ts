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