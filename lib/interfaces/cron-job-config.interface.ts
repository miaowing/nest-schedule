import { IJobConfig } from './job-config.interface';

export interface ICronJobConfig extends IJobConfig {
  startTime?: Date;
  endTime?: Date;
}

export interface ICronObject {
  hour?: number;
  minute?: number;
  second?: number;
  date?: number;
  month?: number;
  year?: number;
  dayOfWeek?: number;
}
