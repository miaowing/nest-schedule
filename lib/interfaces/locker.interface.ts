import { IScheduleConfig } from './schedule-config.interface';

export interface ILocker {
  init(key: string, config: IScheduleConfig): void;

  tryLock(): Promise<boolean> | boolean;

  release(): any;
}
