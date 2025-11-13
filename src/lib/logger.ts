import { config } from './config';

const LOG_LEVELS = {
  error: 0,
  info: 1,
  debug: 2,
};

export const logger = {
  error: (message: string, ...args: any[]) => {
    if (config.LOG_LEVEL >= LOG_LEVELS.error) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (config.LOG_LEVEL >= LOG_LEVELS.info) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  debug: (message: string, ...args: any[]) => {
    if (config.LOG_LEVEL >= LOG_LEVELS.debug) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
};
