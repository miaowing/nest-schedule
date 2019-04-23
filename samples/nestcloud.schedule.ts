import { Injectable } from '@nestjs/common';
import {
  Interval,
  Timeout,
  Cron,
  NestSchedule,
  UseLocker,
} from 'nest-schedule';
import { MyLocker } from './my.locker';

@Injectable()
export class NestcloudSchedule extends NestSchedule {
  @Interval(2000)
  interval(): void {
    console.log('executing interval job');
  }

  @Timeout(2000)
  timeout() {
    console.log('executing timeout job');
  }

  @Cron('*/2 * * * * *')
  @UseLocker(MyLocker)
  cron() {
    console.log('executing cron job');
  }
}
