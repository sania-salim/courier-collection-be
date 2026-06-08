import winston from 'winston';
import path from 'path';

const logDir = 'logs'; // Log directory

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    ({ timestamp, level, message, ...meta }) =>
      `[${timestamp}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
  )
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const logger = winston.createLogger({
  format: fileFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      handleExceptions: true,
    }),

    // Combined log file (all levels)
    new winston.transports.File({
      filename: path.join(logDir, 'allLogs.log'),
      format: fileFormat,
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

export default logger;
