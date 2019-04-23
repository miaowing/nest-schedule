import { ICronJobConfig } from './cron-job-config.interface';

export interface IScheduleConfig extends ICronJobConfig {
  cron?: string;
  interval?: number;
  timeout?: number;
  method?: string;
}
