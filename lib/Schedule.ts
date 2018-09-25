import "reflect-metadata";
import { NEST_SCHEDULE_JOB_KEY } from "./constants";

export interface BaseOptions {
    maxRetry?: number;
    retryInterval?: number;
}

export interface CronOptions extends BaseOptions {
    startTime?: Date;
    endTime?: Date;
    tz?: string;
}

export interface ScheduleOptions extends CronOptions {
    cron?: string;
    interval?: number;
    timeout?: number;
}

export const Schedule = (options: ScheduleOptions) => createSchedule(options);
export const Interval = (milliseconds: number, options: BaseOptions = {}) => createSchedule({ interval: milliseconds, ...options });
export const Timeout = (milliseconds: number, options: BaseOptions = {}) => createSchedule({ timeout: milliseconds, ...options });
export const Cron = (cron: string, options: CronOptions = {}) => createSchedule({ cron, ...options });

const createSchedule = (options: ScheduleOptions) => (target, key, descriptor) => {
    let jobs = Reflect.getMetadata(NEST_SCHEDULE_JOB_KEY, target);
    if (!jobs) {
        jobs = [];
    }

    jobs.push({ ...options, key });
    Reflect.defineMetadata(NEST_SCHEDULE_JOB_KEY, jobs, target);
};