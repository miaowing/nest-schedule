<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Description

This is a [Nest](https://github.com/nestjs/nest) module for using decorator schedule jobs.


## Installation

```bash
$ npm i --save nest-schedule
```


## Usage

```typescript
import { Module } from '@nestjs/common';
import { ScheduleModule } from 'nest-schedule';

@Module({
  imports: [
    ScheduleModule.register(),
  ]
})
export class AppModule {
}
```

```typescript
import { Injectable, LoggerService } from '@nestjs/common';
import { Cron, Interval, Timeout, NestSchedule } from 'nest-schedule';

@Injectable()
export class ScheduleService extends NestSchedule {    
  @Cron('0 0 2 * *', {
    startTime: new Date(), 
    endTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
  })
  async cronJob() {
    console.log('executing cron job');
  }
  
  @Timeout(5000)
  onceJob() {
    console.log('executing once job');
  }
  
  @Interval(2000)
  intervalJob() {
    console.log('executing interval job');
    
    // if you want to cancel the job, you should return true;
    return true;
  }
}
```

### Distributed Support

#### 1. Extend NestDistributedSchedule class

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, NestDistributedSchedule } from 'nest-schedule';

@Injectable()
export class ScheduleService extends NestDistributedSchedule {  
  constructor() {
    super();
  }
  
  async tryLock(method: string) {
    if (lockFail) {
      return false;
    }
    
    return () => {
      // Release here.
    }
  }
  
  @Cron('0 0 4 * *')
  async cronJob() {
    console.log('executing cron job');
  }
}
```

#### 2. Use UseLocker decorator

```typescript
import { ILocker, IScheduleConfig, InjectSchedule, Schedule } from 'nest-schedule';
import { Injectable } from '@nestjs/common';

// If use NestCloud, it supports dependency injection.
@Injectable()
export class MyLocker implements ILocker {
  private key: string;
  private config: IScheduleConfig;

  constructor(
    @InjectSchedule() private readonly schedule: Schedule,
  ) {
  }

  init(key: string, config: IScheduleConfig): void {
    this.key = key;
    this.config = config;
    console.log('init my locker: ', key, config);
  }

  release(): any {
    console.log('release my locker');
  }

  tryLock(): Promise<boolean> | boolean {
    console.log('apply my locker');
    return true;
  }
}
```

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, NestSchedule, UseLocker } from 'nest-schedule';
import { MyLocker } from './my.locker';

@Injectable()
export class ScheduleService extends NestSchedule {  
  @Cron('0 0 4 * *')
  @UseLocker(MyLocker)
  async cronJob() {
    console.log('executing cron job');
  }
}
```

### Log

The schedule uses console as default logger. 

If you want to use yourself log library, please implements LoggerService interface.

```typescript
import { Module } from '@nestjs/common';
import { ScheduleModule } from 'nest-schedule';
import { LoggerService } from '@nestjs/common';

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

@Module({
  imports: [
    ScheduleModule.register({
      logger: new NestLogger(),
    }),
  ]
})
export class AppModule {
}
```


## API

### class ScheduleModule

#### static register\(config: IGlobalConfig\): DynamicModule

Register schedule module.

| field | type | required | description |
| --- | --- | --- | --- |
| config.enable | boolean | false | default is true, when false, the job will not execute |
| config.maxRetry | number | false |  the max retry count, default is -1 not retry |
| config.retryInterval | number | false | the retry interval, default is 5000 |
| config.logger | LoggerService \| boolean | false | custom schedule logger, default is console |

### class Schedule

#### scheduleCronJob(key: string, cron: string, callback: JobCallback, config?: ICronJobConfig)

Schedule a cron job.

| field | type | required | description |
| --- | --- | --- | --- |
| key | string | true | The unique job key |
| cron | string | true | The cron expression |
| callback | () => Promise&lt;boolean&gt; | boolean | If return true in callback function, the schedule will cancel this job immediately |
| config.startTime | Date | false | The start time of this job |
| config.endTime | Date | false | The end time of this job |
| config.enable | boolean | false | default is true, when false, the job will not execute |
| config.maxRetry | number | false |  the max retry count, default is -1 not retry |
| config.retryInterval | number | false | the retry interval, default is 5000 |

#### scheduleIntervalJob(key: string, interval: number, callback: JobCallback, config?: IJobConfig)

Schedule a interval job.

| field | type | required | description |
| --- | --- | --- | --- |
| key | string | true | The unique job key |
| interval | number | true | milliseconds |
| callback | () => Promise&lt;boolean&gt; | boolean | If return true in callback function, the schedule will cancel this job immediately |
| config.enable | boolean | false | default is true, when false, the job will not execute |
| config.maxRetry | number | false |  the max retry count, default is -1 not retry |
| config.retryInterval | number | false | the retry interval, default is 5000 |

#### scheduleTimeoutJob(key: string, timeout: number, callback: JobCallback, config?: IJobConfig)

Schedule a timeout job.

| field | type | required | description |
| --- | --- | --- | --- |
| key | string | true | The unique job key |
| timeout | number | true | milliseconds |
| callback | () => Promise&lt;boolean&gt; | boolean | If return true in callback function, the schedule will cancel this job immediately |
| config.enable | boolean | false | default is true, when false, the job will not execute |
| config.maxRetry | number | false |  the max retry count, default is -1 not retry |
| config.retryInterval | number | false | the retry interval, default is 5000 |

#### cancelJob(key: string)

Cancel job.


## Decorator

### Cron(expression: string, config?: ICronJobConfig): MethodDecorator

Schedule a cron job.

| field | type | required | description |
| --- | --- | --- | --- |
| expression | string | true | the cron expression |
| config.startTime | Date | false | the job's start time |
| config.endTime | Date | false | the job's end time |
| config.enable | boolean | false | default is true, when false, the job will not execute |
| config.maxRetry | number | false |  the max retry count, default is -1 not retry |
| config.retryInterval | number | false | the retry interval, default is 5000 |

### Interval(milliseconds: number, config?: IJobConfig): MethodDecorator

Schedule a interval job.

| field | type | required | description |
| --- | --- | --- | --- |
| milliseconds | number | true | milliseconds |
| config.enable | boolean | false | default is true, when false, the job will not execute |
| config.maxRetry | number | false |  the max retry count, default is -1 not retry |
| config.retryInterval | number | false | the retry interval, default is 5000 |

### Timeout(milliseconds: number, config?: IJobConfig): MethodDecorator

Schedule a timeout job.

| field | type | required | description |
| --- | --- | --- | --- |
| milliseconds | number | true | milliseconds |
| config.enable | boolean | false | default is true, when false, the job will not execute |
| config.maxRetry | number | false |  the max retry count, default is -1 not retry |
| config.retryInterval | number | false | the retry interval, default is 5000 |

### InjectSchedule(): PropertyDecorator

Inject Schedule instance

### UseLocker(locker: ILocker | Function): MethodDecorator

Make your job support distribution, If you use [NestCloud](https://github.com/nest-cloud/nestcloud), the Locker will support dependency injection.


## Stay in touch

- Author - [miaowing](https://github.com/miaowing)

## License

  NestSchedule is [MIT licensed](LICENSE).
