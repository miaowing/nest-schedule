<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Description

This is a [Nest](https://github.com/nestjs/nest) module for using decorator schedule a job.

## Installation

```bash
$ npm i --save nest-schedule
```

## Quick Start

```typescript
import { Injectable, LoggerService } from '@nestjs/common';
import { Cron, Interval, Timeout, NestSchedule, defaults } from 'nest-schedule';

defaults.enable = true;
defaults.logger = new NestLogger();
defaults.maxRetry = -1;
defaults.retryInterval = 5000;

export class NestLogger implements LoggerService {
    log(message: string): any {
        console.log(message);
    }

    error(message: string, trace: string): any {
        console.error(message, trace);
    }

    warn(message: string): any {
        console.warn(message);
    }
}

@Injectable()
export class ScheduleService extends NestSchedule {  
  constructor(
    
  ) {
    super();
  }
  
  @Cron('0 0 2 * *', {
    startTime: new Date(), 
    endTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    tz: 'Asia/Shanghai',
  })
  async syncData() {
    console.log('syncing data ...');
  }
  
  @Cron('0 0 4 * *')
  async clear() {
    console.log('clear data ...');
    await doClear();
  }
  
  @Timeout(5000)
  onceJob() {
    console.log('once job');
  }
  
  @Interval(2000)
  intervalJob() {
    console.log('interval job');
    
    // if you want to cancel the job, you should return true;
    return true;
  }
}
```

### Distributed Support

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, NestDistributedSchedule } from 'nest-schedule';

@Injectable()
export class ScheduleService extends NestDistributedSchedule {  
  constructor() {
    super();
  }
  
  async tryLock(method: string) {
    // If try lock fail, you should throw an error.
    throw new Error('try lock fail');
    
    return () => {
      // Release here.
    }
  }
  
  @Cron('0 0 4 * *')
  async clear() {
    console.log('clear data ...');
  }
}
```

## API

### Common options or defaults

| field | type | required | description |
| --- | --- | --- | --- |
| enable | boolean | false | default is true, when false, the job will not execute |
| maxRetry | number | false |  the max retry count, default is -1 not retry |
| retryInterval | number | false | the retry interval, default is 5000 |
| logger | LoggerService | false | default is false, only available at defaults |

### Cron(expression: string, options: CronOptions)

| field | type | required | description |
| --- | --- | --- | --- |
| expression | string | true | the cron expression |
| options.startTime | Date | false | the job's start time |
| options.endTime | Date | false | the job's end time |
| options.tz | string | false | the time zone |

### Interval(time: number, options: BaseOptions)

| field | type | required | description |
| --- | --- | --- | --- |
| time | number | true | millisecond |
| options | object | false | same as common options |

### Timeout(time: number, options: BaseOptions)

| field | type | required | description |
| --- | --- | --- | --- |
| time | number | true | millisecond |
| options | object | false | same as common options |

## Stay in touch

- Author - [Miaowing](https://github.com/miaowing)

## License

  Nest is [MIT licensed](LICENSE).
