import { Logger } from './types.js';

export const logger: Logger = {
  info: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      process.stdout.write(args.map(String).join(' ') + '\n');
    }
  },
  error: (...args: unknown[]) => {
    process.stderr.write(args.map(String).join(' ') + '\n');
  }
}; 