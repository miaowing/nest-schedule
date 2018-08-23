import { NestDistributedSchedule } from "./NestDistributedSchedule";

export class NestSchedule extends NestDistributedSchedule {
  async tryLock(method: string): Promise<any> {
    return false;
  }
}