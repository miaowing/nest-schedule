import { LoggerService } from '@nestjs/common';
import { DefaultConfig } from "./defaults";

export class JobExecutor {
    private timer;
    private currentRetryCount = 0;

    constructor(
        private readonly configs: DefaultConfig,
        private readonly logger: LoggerService,
    ) {
    }

    async execute(jobKey: string, callback: () => Promise<boolean>, tryLock: (method: string) => Promise<() => void>) {
        if (this.configs.enable) {
            let release;
            if (typeof tryLock === 'function') {
                try {
                    release = await this.do(tryLock(jobKey));
                } catch (e) {
                    this.logger && (this.logger as LoggerService).error(`Try lock job ${jobKey} fail.`, e);
                    return false;
                }
            }

            const result = await this.run(jobKey, callback);

            try {
                typeof release === "function" ? release() : void 0;
            } catch (e) {
                this.logger && (this.logger as LoggerService).error(`Release lock job ${jobKey} fail.`, e);
            }

            return result;
        }
    }

    private async run(jobKey: string, callback: () => Promise<boolean>) {
        try {
            const result = await this.do(callback());
            this.clear();
            return result;
        } catch (e) {
            this.logger && (this.logger as LoggerService).error(`Execute job ${jobKey} fail.`, e);
            if (this.configs.maxRetry !== -1 && this.currentRetryCount < this.configs.maxRetry) {
                if (this.timer) {
                    clearTimeout(this.timer);
                }

                return await new Promise(resolve => {
                    this.timer = setTimeout(async () => {
                        this.currentRetryCount++;
                        resolve(await this.run(jobKey, callback));
                    }, this.configs.retryInterval);
                })
            } else {
                this.logger && (this.logger as LoggerService).error(`Job ${jobKey} already has max retry count.`, e);
                return false;
            }
        }
    }

    private clear() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
            this.currentRetryCount = 0;
        }
    }

    private async do(invoked) {
        if (invoked instanceof Promise) {
            return await invoked;
        }
        return invoked;
    }
}