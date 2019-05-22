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

  public scheduleCronJob(
    key: string,
    cron: string,
    callback: JobCallback,
    config?: ICronJobConfig,
    tryLock?: Promise<TryLock> | TryLock,
  ) {
    this.scheduler.scheduleCronJob(key, cron, callback, config, tryLock);
  }

  public scheduleIntervalJob(
    key: string,
    interval: number,
    callback: JobCallback,
    config?: IJobConfig,
    tryLock?: Promise<TryLock> | TryLock,
  ) {
    this.scheduler.scheduleIntervalJob(
      key,
      interval,
      callback,
      config,
      tryLock,
    );
  }

  public scheduleTimeoutJob(
    key: string,
    timeout: number,
    callback: JobCallback,
    config?: IJobConfig,
    tryLock?: Promise<TryLock> | TryLock,
  ) {
    this.scheduler.scheduleTimeoutJob(key, timeout, callback, config, tryLock);
  }

  /**
   * Get all registered jobs
   */
  public getJobIds() {
    return this.scheduler.getJobIds();
  }

  /**
   * Get jobs by ids
   */
  public getJobById(id: string) {
    return this.scheduler.getJobById(id);
  }
}
