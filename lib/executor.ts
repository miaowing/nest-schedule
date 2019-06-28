import { Logger } from '@nestjs/common';
import { IGlobalConfig } from './interfaces/global-config.interface';

export class Executor {
  private timer;
  private currentRetryCount = 0;
  private logger = new Logger('ScheduleModule');

  constructor(private readonly configs: IGlobalConfig) {}

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
        this.logger.error(`Try lock job ${jobKey} fail. ${e.message}`, e.stack);
        return false;
      }
    }

    const result = await this.run(jobKey, callback);

    try {
      typeof release === 'function' ? release() : void 0;
    } catch (e) {
      this.logger.error(`Release lock job ${jobKey} fail.`, e.stack);
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
      this.logger.error(`Execute job ${jobKey} fail.`, e.stack);
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
        this.logger.error(
          `Job ${jobKey} already has max retry count.`,
          e.stack,
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
