export class JobRepeatException implements Error {
  message: string;
  name: string = 'JobRepeatException';
  stack: string;

  constructor(message?: string, stack?: string) {
    this.message = message;
    this.stack = stack;
  }
}
