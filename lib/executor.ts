import { LoggerService } from '@nestjs/common';
import { IGlobalConfig } from './interfaces/global-config.interface';

export class Executor {
  private timer;
  private currentRetryCount = 0;

  constructor(
    private readonly configs: IGlobalConfig,
    private readonly logger: LoggerService,
  ) {}

  async execute(
    jobKey: string,
    callback: () => Promise<Stop> | Stop,
    tryLock: Promise<TryLock> | TryLock,
  ): Promise<Stop> {
    let release;
    if (typeof tryLock === 'function') {
      try {
        release = await tryLock(jobKey);
        if (!release) {
          return false;
        }
      } catch (e) {
        this.logger &&
          (this.logger as LoggerService).error(
            `Try lock job ${jobKey} fail.`,
            e,
          );
        return false;
      }
    }

    const result = await this.run(jobKey, callback);

    try {
      typeof release === 'function' ? release() : void 0;
    } catch (e) {
      this.logger &&
        (this.logger as LoggerService).error(
          `Release lock job ${jobKey} fail.`,
          e,
        );
    }

    return result;
  }

  private async run(
    jobKey: string,
    callback: () => Promise<Stop> | Stop,
  ): Promise<Stop> {
    try {
      const result = await callback();
      this.clear();
      return result;
    } catch (e) {
      this.logger &&
        (this.logger as LoggerService).error(`Execute job ${jobKey} fail.`, e);
      if (
        this.configs.maxRetry !== -1 &&
        this.currentRetryCount < this.configs.maxRetry
      ) {
        if (this.timer) {
          clearTimeout(this.timer);
        }

        await new Promise(resolve => {
          this.timer = setTimeout(async () => {
            this.currentRetryCount++;
            resolve(await this.run(jobKey, callback));
          }, this.configs.retryInterval);
        });
        return false;
      } else {
        this.logger &&
          (this.logger as LoggerService).error(
            `Job ${jobKey} already has max retry count.`,
            e,
          );
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
}
