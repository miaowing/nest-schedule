import "reflect-metadata";
import { NEST_SCHEDULE_JOB_KEY } from "./constants";

export interface Options {
  cron?: string;
  interval?: number;
  timeout?: number;
  startTime?: Date;
  endTime?: Date;
}

export const Schedule = (options: Options) => (target, key, descriptor) => {
  let jobs = Reflect.getMetadata(NEST_SCHEDULE_JOB_KEY, target);
  if (!jobs) {
    jobs = [];
  }

  jobs.push({ ...options, key });
  Reflect.defineMetadata(NEST_SCHEDULE_JOB_KEY, jobs, target);
};