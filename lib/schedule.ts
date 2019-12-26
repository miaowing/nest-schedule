import { ICronJobConfig } from './interfaces/cron-job-config.interface';
import { IJobConfig } from './interfaces/job-config.interface';
import { Scheduler } from './scheduler';
import { IGlobalConfig } from './interfaces/global-config.interface';
import { defaults } from './defaults';

export class Schedule {
  private readonly scheduler = Scheduler;

  constructor(globalConfig?: IGlobalConfig) {
    if (globalConfig) {
      for (const key in globalConfig) {
        defaults[key] = globalConfig[key];
      }
    }
  }

  public cancelJob(key: string) {
    this.scheduler.cancelJob(key);
  }

  public cancelJobs() {
    this.scheduler.cancelJobs();
  }

  public scheduleCronJob(
    key: string,
    cron: string,
    callback: JobCallback,
    config?: ICronJobConfig,
  ) {
    this.scheduler.scheduleCronJob(key, cron, callback, config);
  }

  public scheduleIntervalJob(
    key: string,
    interval: number,
    callback: JobCallback,
    config?: IJobConfig,
  ) {
    this.scheduler.scheduleIntervalJob(key, interval, callback, config);
  }

  public scheduleTimeoutJob(
    key: string,
    timeout: number,
    callback: JobCallback,
    config?: IJobConfig,
  ) {
    this.scheduler.scheduleTimeoutJob(key, timeout, callback, config);
  }
}
