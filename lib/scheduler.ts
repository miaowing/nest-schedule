import * as schedule from 'node-schedule';
import { Executor } from './executor';
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

  public static scheduleCronJob(
    key: string,
    cron: string,
    cb: JobCallback,
    config?: ICronJobConfig,
    tryLock?: Promise<TryLock> | TryLock,
  ) {
    this.assertJobNotExist(key);
    const configs = Object.assign({}, defaults, config);
    const instance = schedule.scheduleJob(
      {
        // BUG: Triggered undefined when the params were optional
        start: config ? config.startTime : null,
        // BUG: Triggered undefined when the params were optional
        end: config ? config.endTime : null,
        rule: cron,
      },
      async () => {
        const job = this.jobs.get(key);
        if (configs.waiting && job.status !== READY) {
          return false;
        }
        job.status = RUNNING;

        const executor = new Executor(configs);

        job.status = READY;
        const needStop = await executor.execute(key, cb, tryLock);
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
    this.assertJobNotExist(key);
    const configs = Object.assign({}, config, config);
    const timer = setInterval(async () => {
      const job = this.jobs.get(key);
      if (configs.waiting && job.status !== READY) {
        return false;
      }
      job.status = RUNNING;

      const executor = new Executor(configs);
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
    this.assertJobNotExist(key);
    const configs = Object.assign({}, defaults, config);
    const timer = setTimeout(async () => {
      const job = this.jobs.get(key);
      if (configs.waiting && job.status !== READY) {
        return false;
      }
      job.status = RUNNING;

      const executor = new Executor(configs);
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
    const executor = new Executor(configs);
    const needStop = await executor.execute(key, cb, tryLock);
    job.status = READY;
    if (needStop) {
      this.cancelJob(key);
    }
  }

  private static assertJobNotExist(key: string) {
    if (this.jobs.has(key)) {
      throw new JobRepeatException(`The job ${key} is exists.`);
    }
  }
}
