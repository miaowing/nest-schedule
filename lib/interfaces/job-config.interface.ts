export interface IJobConfig {
  maxRetry?: number;
  retryInterval?: number;
  enable?: boolean;
  key?: string;

  // available for interval and cron job
  waiting?: boolean;
  immediate?: boolean;
}
