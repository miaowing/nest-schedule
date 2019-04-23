import { Injectable, OnModuleInit } from '@nestjs/common';
import { Schedule, InjectSchedule } from 'nest-schedule';

@Injectable()
export class DynamicScheduleService implements OnModuleInit {
  constructor(@InjectSchedule() private readonly schedule: Schedule) {}

  onModuleInit(): any {
    this.schedule.scheduleIntervalJob('custom_interval_job', 3000, () => {
      console.log('executing my custom interval job');
      return false;
    });
  }
}
