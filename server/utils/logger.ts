import { env } from '../config/env';

/**
 * Simple logger utility
 */
class Logger {
  private logLevel: Record<string, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  };
  
  private currentLevel: number;
  
  constructor() {
    this.currentLevel = this.logLevel[env.LOG_LEVEL];
  }
  
  /**
   * Log an error message
   */
  error(message: string, ...args: any[]): void {
    if (this.currentLevel >= this.logLevel.error) {
      console.error(`❌ ERROR: ${message}`, ...args);
    }
  }
  
  /**
   * Log a warning message
   */
  warn(message: string, ...args: any[]): void {
    if (this.currentLevel >= this.logLevel.warn) {
      console.warn(`⚠️ WARN: ${message}`, ...args);
    }
  }
  
  /**
   * Log an info message
   */
  info(message: string, ...args: any[]): void {
    if (this.currentLevel >= this.logLevel.info) {
      console.info(`ℹ️ INFO: ${message}`, ...args);
    }
  }
  
  /**
   * Log a debug message
   */
  debug(message: string, ...args: any[]): void {
    if (this.currentLevel >= this.logLevel.debug) {
      console.debug(`🔍 DEBUG: ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
