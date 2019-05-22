import * as schedule from 'node-schedule';
import { Executor } from './executor';
import { LoggerService } from '@nestjs/common';
import { defaults } from './defaults';
import { ICronJobConfig } from './interfaces/cron-job-config.interface';
import { IJobConfig } from './interfaces/job-config.interface';
import { IJob } from './interfaces/job.interface';
import { Job } from 'node-schedule';
import { IScheduleConfig } from './interfaces/schedule-config.interface';
import { READY, RUNNING } from './constants';
import { JobRepeatException } from './exceptions/job-repeat.exception';

export class Scheduler {
  private static readonly jobs = new Map<string, IJob>();

  public static queueJob(job: IJob) {
    if (this.jobs.has(job.key)) {
      throw new JobRepeatException(
        `The job ${
          job.key
        } has already exists, please set key attribute rename it`,
      );
    }
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
          clearInterval(job.timer);
          break;
        case 'timeout':
          clearTimeout(job.timer);
          break;
      }

      this.jobs.delete(key);
    }
  }

  private static parseDate(inp: any): Date {
    const ret = new Date(inp);
    if (Object.prototype.toString.call(ret) === '[object Date]') {
      // it is a date
      if (isNaN(ret.getTime())) {
        // d.valueOf() could also work
        return undefined;
      } else {
        return ret;
      }
    } else {
      return undefined;
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
    const startTime = this.parseDate(config && config.startTime);
    const endTime = this.parseDate(config && config.endTime);
    const instance = schedule.scheduleJob(
      {
        start: startTime,
        end: endTime,
        rule: cron,
      },
      async (...args: any[]) => {
        const job = this.jobs.get(key);
        if (configs.waiting && job.status !== READY) {
          return false;
        }
        job.status = RUNNING;

        const executor = new Executor(
          configs,
          defaults.logger as LoggerService,
        );

        job.status = READY;
        const needStop = await executor.execute(key, cb, args, tryLock);
        if (needStop) {
          this.cancelJob(key);
        }
      },
    );

    this.addJob(key, 'cron', config, { instance });
    if (configs.immediate) {
      this.runJobImmediately(key, configs, cb, tryLock);
    }
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
      const job = this.jobs.get(key);
      if (configs.waiting && job.status !== READY) {
        return false;
      }
      job.status = RUNNING;

      const executor = new Executor(configs, defaults.logger as LoggerService);
      const needStop = await executor.execute(key, cb, tryLock);

      job.status = READY;

      if (needStop) {
        this.cancelJob(key);
      }
    }, interval);

    this.addJob(key, 'interval', config, { timer });
    if (configs.immediate) {
      this.runJobImmediately(key, configs, cb, tryLock);
    }
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
      const job = this.jobs.get(key);
      if (configs.waiting && job.status !== READY) {
        return false;
      }
      job.status = RUNNING;

      const executor = new Executor(configs, defaults.logger as LoggerService);
      await executor.execute(key, cb, tryLock);

      job.status = READY;

      this.cancelJob(key);
    }, timeout);

    this.addJob(key, 'timeout', config, { timer });
    if (configs.immediate) {
      this.runJobImmediately(key, configs, cb, tryLock);
    }
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
      status: READY,
    });
  }

  private static async runJobImmediately(
    key: string,
    configs,
    cb: JobCallback,
    tryLock,
  ) {
    const job = this.jobs.get(key);
    if (configs.waiting && job.status !== READY) {
      return false;
    }
    job.status = RUNNING;
    const executor = new Executor(configs, defaults.logger as LoggerService);
    const needStop = await executor.execute(key, cb, tryLock);
    job.status = READY;
    if (needStop) {
      this.cancelJob(key);
    }
  }

  /**
   * Get all registered jobs
   */
  public static getJobIds() {
    return [...this.jobs.keys()];
  }

  /**
   * Get jobs by ids
   */
  public static getJobById(id: string) {
    return this.jobs.has(id) ? this.jobs.get(id) : undefined;
  }
}
