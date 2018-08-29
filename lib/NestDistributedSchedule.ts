import * as schedule from "node-schedule";
import { NEST_SCHEDULE_JOB_KEY } from "./constants";

export abstract class NestDistributedSchedule {
  private readonly jobs;
  private readonly timers = {};

  protected constructor() {
    this.jobs = Reflect.getMetadata(NEST_SCHEDULE_JOB_KEY, new.target.prototype);
    this.init();
  }

  abstract async tryLock(method: string): Promise<() => void>;

  private async do(invoked) {
    if (invoked instanceof Promise) {
      return await invoked;
    }
    return invoked;
  }

  private init() {
    if (this.jobs) {
      this.jobs.forEach(async job => {
        if (job.cron) {
          const _job = schedule.scheduleJob({
            startTime: job.startTime,
            endTime: job.endTime,
            rule: job.cron
          }, async () => {
            try {
              const release = await this.do(this.tryLock(job.key));
              const result = await this.do(this[job.key]());
              if (result && _job) {
                _job.cancel();
              }
              typeof release === "function" ? release() : void 0;
            } catch (e) {
            }
          });
        }
        if (job.interval) {
          this.timers[job.key] = setInterval(async () => {
            try {
              const release = await this.do(this.tryLock(job.key));
              const result = await this.do(this[job.key]());
              if (result && this.timers[job.key]) {
                clearInterval(this.timers[job.key]);
                delete this.timers[job.key];
              }
              typeof release === "function" ? release() : void 0;
            } catch (e) {
            }
          }, job.interval);
        }
        if (job.timeout) {
          this.timers[job.key] = setTimeout(async () => {
            try {
              const release = await this.do(this.tryLock(job.key));
              const result = await this.do(this[job.key]());
              if (result && this.timers[job.key]) {
                clearTimeout(this.timers[job.key]);
                delete this.timers[job.key];
              }
              typeof release === "function" ? release() : void 0;
            } catch (e) {
            }
          }, job.timeout);
        }
      });
    }
  }
}