import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { DistributedScheduleService } from './distributed-schedule.service';
import { NestcloudSchedule } from './nestcloud.schedule';
import { DynamicScheduleService } from './dynamic-schedule.service';
import { ScheduleModule } from 'nest-schedule';
import { DynamicCronService } from './dynamic-cron.service';

@Module({
  imports: [ScheduleModule.register({})],
  providers: [
    ScheduleService,
    DistributedScheduleService,
    NestcloudSchedule,
    DynamicScheduleService,
    DynamicCronService,
  ],
})
export class AppModule {}
