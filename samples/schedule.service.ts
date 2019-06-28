import { Injectable } from '@nestjs/common';
import { Interval, Timeout, Cron, NestSchedule } from 'nest-schedule';

@Injectable()
export class ScheduleService extends NestSchedule {
  @Interval(2000, { key: 'schedule-interval' })
  interval(): void {
    console.log('executing interval job');
  }

  @Timeout(2000, { key: 'schedule-timeout' })
  timeout() {
    console.log('executing timeout job');
  }

  @Cron('*/2 * * * * *', { key: 'schedule-cron' })
  cron() {
    console.log('executing cron job');
  }
}
