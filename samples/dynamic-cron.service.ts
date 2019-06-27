import { InjectSchedule, Schedule } from 'nest-schedule';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class DynamicCronService implements OnModuleInit {
  constructor(@InjectSchedule() private readonly schedule: Schedule) {}

  onModuleInit(): any {
    // Activates every 10 seconds
    this.schedule.scheduleCronJob('custom_cron_job', '*/10 * * * * *', () => {
      console.log('executing my custom cron job');
      return false;
    });
  }
}
