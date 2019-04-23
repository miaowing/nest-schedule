import 'reflect-metadata';
import { extendMetadata } from '../utils/metadata.util';
import { GUARDS_METADATA, NEST_SCHEDULE_LOCKER } from '../constants';
import { ILocker } from '../interfaces/locker.interface';

export const UseLocker = (Locker: ILocker | Function): MethodDecorator => (
  target,
  key,
  descriptor,
) => {
  extendMetadata(NEST_SCHEDULE_LOCKER, { Locker, key }, target);

  // hack
  extendMetadata(GUARDS_METADATA, Locker, descriptor.value);
};
