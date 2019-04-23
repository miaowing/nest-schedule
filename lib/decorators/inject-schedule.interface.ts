import { Inject } from '@nestjs/common';
import { NEST_SCHEDULE_PROVIDER } from '../constants';

export const InjectSchedule = () => Inject(NEST_SCHEDULE_PROVIDER);
