import { NEST_SCHEDULE_JOB_KEY, NEST_SCHEDULE_LOCKER } from './constants';
import { Scheduler } from './scheduler';
import { ILocker } from './interfaces/locker.interface';
import { chooseModule, getInstance } from './utils/module.util';
import { IScheduleConfig } from './interfaces/schedule-config.interface';
import { IJob } from './interfaces/job.interface';

export abstract class NestDistributedSchedule {
  private readonly __jobs;
  private readonly __lockers = new Map<string, ILocker | Function>();

  protected constructor() {
    this.__jobs = Reflect.getMetadata(
      NEST_SCHEDULE_JOB_KEY,
      new.target.prototype,
    );
    const lockers = Reflect.getMetadata(
      NEST_SCHEDULE_LOCKER,
      new.target.prototype,
    );
    if (lockers) {
      lockers.forEach(item => this.__lockers.set(item.key, item.Locker));
    }

    this.init();
  }

  abstract tryLock?(method: string): Promise<TryRelease> | TryRelease;

  private getLocker(key: string) {
    if (!this.__lockers.has(key)) {
      return null;
    }

    const Locker = this.__lockers.get(key) as Function;
    if (Locker) {
      const module = chooseModule(Locker);
      if (module) {
        const instance: ILocker = getInstance(module, Locker);
        if (instance) {
          return instance;
        }
      }

      return new (Locker as any)();
    }
  }

  private init() {
    if (this.__jobs) {
      this.__jobs.forEach(async (config: IScheduleConfig) => {
        const tryLock = async () => {
          const locker: ILocker = this.getLocker(config.method);
          locker.init(config.key, config);
          const succeed = await locker.tryLock();
          if (!succeed) {
            return false;
          }
          return () => locker.release();
        };
        const job = {
          key: config.key,
          config,
          type: config.cron ? 'cron' : config.interval ? 'interval' : 'timeout',
          method: () => this[config.method](),
          tryLock: this.isLockerExist(config.method)
            ? tryLock
            : this.tryLock.bind(this),
        } as IJob;
        Scheduler.queueJob(job);
      });
    }
  }

  private isLockerExist(key: string) {
    return !!this.__lockers.has(key);
  }
}
