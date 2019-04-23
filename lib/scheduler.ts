import * as schedule from 'node-schedule';
import { Executor } from './executor';
import { LoggerService } from '@nestjs/common';
import { defaults } from './defaults';
import { ICronJobConfig } from './interfaces/cron-job-config.interface';
import { IJobConfig } from './interfaces/job-config.interface';
import { IJob } from './interfaces/job.interface';
import { Job } from 'node-schedule';
import { IScheduleConfig } from './interfaces/schedule-config.interface';

export class Scheduler {
  private static readonly jobs = new Map<string, IJob>();

  public static queueJob(job: IJob) {
    const config = Object.assign({}, defaults, job.config);
    if (config.enable) {
      if (job.type === 'cron') {
        Scheduler.scheduleCronJob(
          job.key,
          config.cron,
          job.method,
          config,
          job.tryLock,
        );
      }
      if (job.type === 'interval') {
        Scheduler.scheduleIntervalJob(
          job.key,
          job.config.interval,
          job.method,
          config,
          job.tryLock,
        );
      }
      if (job.type === 'timeout') {
        Scheduler.scheduleTimeoutJob(
          job.key,
          job.config.timeout,
          job.method,
          config,
          job.tryLock,
        );
      }
    }
  }

  public static cancelJob(key: string) {
    const job = this.jobs.get(key);
    if (job) {
      switch (job.type) {
        case 'cron':
          job.instance.cancel();
          break;
        case 'interval':
        case 'timeout':
          clearTimeout(job.timer);
          break;
      }

      this.jobs.delete(key);
    }
  }

  public static scheduleCronJob(
    key: string,
    cron: string,
    cb: JobCallback,
    config?: ICronJobConfig,
    tryLock?: Promise<TryLock> | TryLock,
  ) {
    const configs = Object.assign({}, defaults, config);
    const instance = schedule.scheduleJob(
      {
        start: config.startTime,
        end: config.endTime,
        rule: cron,
      },
      async () => {
        const executor = new Executor(
          configs,
          defaults.logger as LoggerService,
        );
        const needStop = await executor.execute(key, cb, tryLock);
        if (needStop) {
          this.cancelJob(key);
        }
      },
    );
    this.addJob(key, 'cron', config, { instance });
  }

  public static scheduleIntervalJob(
    key: string,
    interval: number,
    cb: JobCallback,
    config?: IJobConfig,
    tryLock?: Promise<TryLock> | TryLock,
  ) {
    const configs = Object.assign({}, config, config);
    const timer = setInterval(async () => {
      const executor = new Executor(configs, defaults.logger as LoggerService);
      const needStop = await executor.execute(key, cb, tryLock);
      if (needStop) {
        this.cancelJob(key);
      }
    }, interval);
    this.addJob(key, 'interval', config, { timer });
  }

  public static scheduleTimeoutJob(
    key: string,
    timeout: number,
    cb: JobCallback,
    config?: IJobConfig,
    tryLock?: Promise<TryLock> | TryLock,
  ) {
    const configs = Object.assign({}, defaults, config);
    const timer = setTimeout(async () => {
      const executor = new Executor(configs, defaults.logger as LoggerService);
      const needStop = await executor.execute(key, cb, tryLock);
      if (needStop) {
        this.cancelJob(key);
      }
    }, timeout);
    this.addJob(key, 'timeout', config, { timer });
  }

  private static addJob(
    key: string,
    type: 'cron' | 'interval' | 'timeout',
    config: IScheduleConfig,
    extra: { instance?: Job; timer?: NodeJS.Timer },
  ) {
    this.jobs.set(key, {
      type,
      config,
      key,
      timer: extra.timer,
      instance: extra.instance,
    });
  }
}
