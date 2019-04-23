import { IJobConfig } from './job-config.interface';

export interface ICronJobConfig extends IJobConfig {
  startTime?: Date;
  endTime?: Date;
}
