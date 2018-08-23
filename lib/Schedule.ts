import "reflect-metadata";
import { NEST_SCHEDULE_JOB_KEY } from "./constants";

export interface Options {
  cron?: string;
  interval?: number;
  timeout?: number;
  startTime?: Date;
  endTime?: Date;
  tz?: string;
}

export const Schedule = (options: Options) => createSchedule(options);
export const Interval = (milliseconds: number) => createSchedule({ interval: milliseconds });
export const Timeout = (milliseconds: number) => createSchedule({ timeout: milliseconds });
export const Cron = (cron: string, options: {
  startTime?: Date,
  endTime?: Date,
  tz?: string
} = {}) => createSchedule({ cron, ...options });

const createSchedule = (options: Options) => (target, key, descriptor) => {
  let jobs = Reflect.getMetadata(NEST_SCHEDULE_JOB_KEY, target);
  if (!jobs) {
    jobs = [];
  }

  jobs.push({ ...options, key });
  Reflect.defineMetadata(NEST_SCHEDULE_JOB_KEY, jobs, target);
};