import { LoggerService } from '@nestjs/common';

export interface DefaultConfig {
    enable?: boolean;
    logger?: LoggerService | boolean;
    maxRetry?: number;
    retryInterval?: number;
}

export const defaults: DefaultConfig = {
    enable: true,
    logger: false,
    maxRetry: -1,
    retryInterval: 5000,
};