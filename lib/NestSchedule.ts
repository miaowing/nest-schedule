import "reflect-metadata";
import { NEST_SCHEDULE_JOB_KEY } from "./constants";
import * as schedule from "node-schedule";

export class NestSchedule {
  private readonly jobs;
  private readonly timers = {};

  constructor() {
    this.jobs = Reflect.getMetadata(NEST_SCHEDULE_JOB_KEY, new.target.prototype);
    this.init();
  }

  private init() {
    if (this.jobs) {
      this.jobs.forEach(job => {
        if (job.cron) {
          job = schedule.scheduleJob({
            startTime: job.startTime,
            endTime: job.endTime,
            rule: job.cron
          }, async () => {
            let result = this[job.key]();
            if (result instanceof Promise) {
              result = await result;
            }
            if (result && job) {
              job.cancel();
            }
          });
        }
        if (job.interval) {
          this.timers[job.key] = setInterval(async () => {
            let result = this[job.key]();
            if (result instanceof Promise) {
              result = await result;
            }
            if (result && this.timers[job.key]) {
              clearInterval(this.timers[job.key]);
              delete this.timers[job.key];
            }
          }, job.interval);
        }
        if (job.timeout) {
          this.timers[job.key] = setTimeout(async () => {
            let result = this[job.key]();
            if (result instanceof Promise) {
              result = await result;
            }
            if (result && this.timers[job.key]) {
              clearTimeout(this.timers[job.key]);
              delete this.timers[job.key];
            }
          }, job.timeout);
        }
      });
    }
  }
}