import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { DistributedScheduleService } from './distributed-schedule.service';
import { NestcloudSchedule } from './nestcloud.schedule';
import { DynamicScheduleService } from './dynamic-schedule.service';
import { ScheduleModule } from 'nest-schedule';

@Module({
  imports: [ScheduleModule.register({})],
  providers: [
    ScheduleService,
    DistributedScheduleService,
    NestcloudSchedule,
    DynamicScheduleService,
  ],
})
export class AppModule {}
