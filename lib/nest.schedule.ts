import { NestDistributedSchedule } from './nest-distributed.schedule';

export class NestSchedule extends NestDistributedSchedule {
  constructor() {
    super();
  }

  async tryLock(method: string): Promise<boolean> {
    return true;
  }
}
