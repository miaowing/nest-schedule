import "reflect-metadata";
import * as schedule from "node-schedule";

export class Options {
  cron?: string;
  interval?: number;
  timeout?: number;
  startTime?: Date;
  endTime?: Date;
}

export const Schedule = (options: Options) => (target, key, descriptor) => {
  const oldValue = descriptor.value;
  let job, intervalTimer, timer;
  const init = function() {
    if (options.cron) {
      job = schedule.scheduleJob({
        startTime: options.startTime,
        endTime: options.endTime,
        rule: options.cron
      }, async () => {
        let result = oldValue.call(this);
        if (result instanceof Promise) {
          result = await result;
        }
        if (result && job) {
          job.cancel();
        }
      });
    }
    if (options.interval) {
      intervalTimer = setInterval(async () => {
        let result = oldValue.call(this);
        if (result instanceof Promise) {
          result = await result;
        }
        if (result && intervalTimer) {
          clearInterval(intervalTimer);
          intervalTimer = null;
        }
      }, options.interval);
    }
    if (options.timeout) {
      timer = setTimeout(async () => {
        let result = oldValue.call(this);
        if (result instanceof Promise) {
          result = await result;
        }
        if (result && timer) {
          clearTimeout(timer);
          timer = null;
        }
      }, options.timeout);
    }
  };

  init();
  return descriptor;
};