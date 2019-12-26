import 'reflect-metadata';
import { NEST_SCHEDULE_JOB_KEY } from '../constants';
import {
  ICronJobConfig,
  ICronObject,
} from '../interfaces/cron-job-config.interface';
import { IJobConfig } from '../interfaces/job-config.interface';
import { IScheduleConfig } from '../interfaces/schedule-config.interface';
import { extendMetadata } from '../utils/metadata.util';

export const Interval = (milliseconds: number, config: IJobConfig = {}) =>
  createSchedule({ interval: milliseconds, ...config });
export const Timeout = (milliseconds: number, config: IJobConfig = {}) =>
  createSchedule({ timeout: milliseconds, ...config });
export const Cron = (cron: string | ICronObject, config: ICronJobConfig = {}) =>
  createSchedule({ cron, ...config });

const createSchedule = (config: IScheduleConfig) => (
  target,
  key,
  descriptor,
) => {
  const identity = config.key ? config.key : key;
  extendMetadata(
    NEST_SCHEDULE_JOB_KEY,
    { ...config, key: identity, method: key },
    target,
  );
};
