import * as schedule from "node-schedule";
import { NEST_SCHEDULE_JOB_KEY } from "./constants";
import { defaults } from './defaults';
import { JobExecutor } from './JobExecutor';

export abstract class NestDistributedSchedule {
    private readonly jobs;
    private readonly timers = {};

    protected constructor() {
        this.jobs = Reflect.getMetadata(NEST_SCHEDULE_JOB_KEY, new.target.prototype);
        this.init();
    }

    abstract async tryLock(method: string): Promise<() => void>;

    private init() {
        if (this.jobs) {
            this.jobs.forEach(async job => {
                const configs = Object.assign({}, defaults, job);
                if (job.cron && configs.enable) {
                    const _job = schedule.scheduleJob({
                        startTime: job.startTime,
                        endTime: job.endTime,
                        tz: job.tz,
                        rule: job.cron
                    }, async () => {
                        const executor = new JobExecutor(configs, configs.logger);
                        const result = await executor.execute(job.key, () => this[job.key](), this.tryLock.bind(this));
                        if (result && _job) {
                            _job.cancel();
                        }
                    });
                }
                if (job.interval && configs.enable) {
                    this.timers[job.key] = setInterval(async () => {
                        const executor = new JobExecutor(configs, configs.logger);
                        const result = await executor.execute(job.key, () => this[job.key](), this.tryLock.bind(this));
                        if (result && this.timers[job.key]) {
                            clearInterval(this.timers[job.key]);
                            delete this.timers[job.key];
                        }
                    }, job.interval);
                }
                if (job.timeout && configs.enable) {
                    this.timers[job.key] = setTimeout(async () => {
                        const executor = new JobExecutor(configs, configs.logger);
                        const result = await executor.execute(job.key, () => this[job.key](), this.tryLock.bind(this));
                        if (result && this.timers[job.key]) {
                            clearTimeout(this.timers[job.key]);
                            delete this.timers[job.key];
                        }
                    }, job.timeout);
                }
            });
        }
    }
}
