import { IGlobalConfig } from './interfaces/global-config.interface';

export const defaults: IGlobalConfig = {
  enable: true,
  maxRetry: -1,
  retryInterval: 5000,
};
