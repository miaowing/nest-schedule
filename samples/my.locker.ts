import {
  ILocker,
  IScheduleConfig,
  InjectSchedule,
  Schedule,
} from 'nest-schedule';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyLocker implements ILocker {
  private key: string;
  private config: IScheduleConfig;

  constructor(@InjectSchedule() private readonly schedule: Schedule) {}

  init(key: string, config: IScheduleConfig): void {
    this.key = key;
    this.config = config;
    console.log('init my locker: ', key, config, this.schedule);
  }

  release(): any {
    console.log('release my locker');
  }

  tryLock(): Promise<boolean> | boolean {
    console.log('apply my locker');
    return true;
  }
}
