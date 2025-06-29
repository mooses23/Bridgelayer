export interface LogMetadata {
  [key: string]: any;
}

export class Logger {
  private source: string;

  constructor(source: string) {
    this.source = source;
  }

  info(message: string, metadata?: LogMetadata) {
    console.log(JSON.stringify({
      level: 'info',
      source: this.source,
      message,
      timestamp: new Date().toISOString(),
      ...metadata
    }));
  }

  error(message: string, metadata?: LogMetadata) {
    console.error(JSON.stringify({
      level: 'error',
      source: this.source,
      message,
      timestamp: new Date().toISOString(),
      ...metadata
    }));
  }

  warn(message: string, metadata?: LogMetadata) {
    console.warn(JSON.stringify({
      level: 'warn',
      source: this.source,
      message,
      timestamp: new Date().toISOString(),
      ...metadata
    }));
  }

  debug(message: string, metadata?: LogMetadata) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(JSON.stringify({
        level: 'debug',
        source: this.source,
        message,
        timestamp: new Date().toISOString(),
        ...metadata
      }));
    }
  }
}
