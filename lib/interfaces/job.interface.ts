import { IScheduleConfig } from './schedule-config.interface';
import { Job } from 'node-schedule';

export interface IJob {
  key: string;
  config: IScheduleConfig;
  type: 'cron' | 'interval' | 'timeout';
  instance?: Job;
  timer?: NodeJS.Timer;
  method?: () => Promise<Stop> | Stop;
  tryLock?: TryLock | Promise<TryLock>;
  status: string;
}
