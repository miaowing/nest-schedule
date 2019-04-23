import { Module, DynamicModule, Global } from '@nestjs/common';
import { NEST_SCHEDULE_PROVIDER } from './constants';
import { Schedule } from './schedule';
import { IGlobalConfig } from './interfaces/global-config.interface';

@Global()
@Module({})
export class ScheduleModule {
  static register(globalConfig?: IGlobalConfig): DynamicModule {
    const scheduleProvider = {
      provide: NEST_SCHEDULE_PROVIDER,
      useFactory: (): Schedule => new Schedule(globalConfig),
    };
    return {
      module: ScheduleModule,
      providers: [scheduleProvider],
      exports: [scheduleProvider],
    };
  }
}
