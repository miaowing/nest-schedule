import { LoggerService } from '@nestjs/common';

export interface IGlobalConfig {
  logger?: LoggerService | boolean;
  maxRetry?: number;
  retryInterval?: number;
  enable?: boolean;
}
