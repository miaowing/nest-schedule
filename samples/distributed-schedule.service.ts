import { Injectable } from '@nestjs/common';
import {
  Interval,
  Timeout,
  Cron,
  NestDistributedSchedule,
} from 'nest-schedule';

@Injectable()
export class DistributedScheduleService extends NestDistributedSchedule {
  constructor() {
    super();
  }

  @Interval(2000)
  interval(): void {
    console.log('executing interval job');
  }

  @Timeout(2000)
  timeout() {
    console.log('executing timeout job');
  }

  @Cron('*/2 * * * * *')
  cron() {
    console.log('executing cron job');
  }

  tryLock(method: string): Promise<TryRelease> | TryRelease {
    console.log('try apply a lock: ', method);
    return () => {
      console.log('try release a lock: ', method);
    };
  }
}
