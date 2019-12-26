import { ICronJobConfig, ICronObject } from './cron-job-config.interface';

export interface IScheduleConfig extends ICronJobConfig {
  cron?: string | ICronObject;
  interval?: number;
  timeout?: number;
  method?: string;
}
