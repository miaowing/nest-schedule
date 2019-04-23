import { Injectable } from '@nestjs/common';
import { Interval, Timeout, Cron, NestSchedule } from 'nest-schedule';

@Injectable()
export class ScheduleService extends NestSchedule {
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
}
