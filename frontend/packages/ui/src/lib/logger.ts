import path from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file';

const logsDir = path.join(process.cwd(), 'logs');

/**
 * NOTE:
 * Example Implementation of logger is given 
 * in src/app/api/user/route.ts
 */

const transport: any = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info',
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    transport,
    new winston.transports.Console(),
  ],
});

export default logger;