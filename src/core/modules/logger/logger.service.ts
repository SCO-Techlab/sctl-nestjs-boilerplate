import { Injectable } from '@nestjs/common';
import { DATE_PATTERNS, MAGIC_NUMBERS } from '@shared/constants';
import { createLogger, format, Logger, transports } from 'winston';
import 'winston-daily-rotate-file';
import { LogLevel } from './logger.types';

@Injectable()
export class LoggerService {

  private readonly LEVELS: Record<string, LogLevel> = {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    DEBUG: 'debug',
    VERBOSE: 'verbose',
    ALL: 'all',
  };

  private loggers: Map<LogLevel, Logger> = new Map();

  private dateFormat = format.timestamp({
    format: DATE_PATTERNS.DATETIME,
  });

  private textFormat = format.printf((log) => {
    return `${log.timestamp} - [${log.level.toUpperCase().charAt(MAGIC_NUMBERS.N_0)}] ${log.message}`;
  });

  constructor() {
    this.createLoggers();
    this.replaceConsole();
  }

  public log(message: string, prefix: string = ''): void {
    message = this.fillMessageWithPrefix(message, prefix);
    this.write('info', message);
  }

  public warn(message: string, prefix: string = ''): void {
    message = this.fillMessageWithPrefix(message, prefix);
    this.write('warn', message);
  }

  public error(message: string, prefix: string = ''): void {
    message = this.fillMessageWithPrefix(message, prefix);
    this.write('error', message);
  }

  public debug(message: string, prefix: string = ''): void {
    message = this.fillMessageWithPrefix(message, prefix);
    this.write('debug', message);
  }

  public verbose(message: string, prefix: string = ''): void {
    message = this.fillMessageWithPrefix(message, prefix);
    this.write('verbose', message);
  }

  private createLoggers(): void {
    Object.values(this.LEVELS).forEach(level => {
      this.loggers.set(level, this.createLoggerObject(level));
    });
  }

  private replaceConsole(): void {
    console.log = this.createConsoleWrapper('info');
    console.info = this.createConsoleWrapper('info');
    console.warn = this.createConsoleWrapper('warn');
    console.error = this.createConsoleWrapper('error');
    console.debug = this.createConsoleWrapper('debug');
    console.trace = this.createConsoleWrapper('verbose');
  }

  private createConsoleWrapper(level: LogLevel): any {
    return (...args: any[]) => {
      const message = args
        .map(arg =>
          typeof arg === 'string' ? arg : JSON.stringify(arg),
        )
        .join(' ');

      this.write(level, message);
    };
  }

  private write(level: LogLevel, message: string): void {
    const logger = this.loggers.get(level);
    const loggerAll = this.loggers.get('all');

    if (logger) {
      logger.log(level === 'all' ? 'info' : level, message);
    }

    loggerAll?.log(level === 'all' ? 'info' : level, message);
  }

  private createLoggerObject(level: LogLevel): Logger {
    const loggerConfig: any = {
      level: level === 'all' ? 'verbose' : level,
      format: format.combine(
        this.dateFormat,
        this.textFormat,
      ),
      transports: [
        new transports.DailyRotateFile({
          filename: `log/${level}/${level}-%DATE%.log`,
          datePattern: DATE_PATTERNS.DATE,
          maxFiles: `${MAGIC_NUMBERS.N_7}d`,
        }),
      ],
    };

    if (level === 'all') {
      loggerConfig.transports.push(new transports.Console());
    }

    return createLogger(loggerConfig);
  }

  private fillMessageWithPrefix(message: string, prefix: string): string {
    if (!prefix) {
      return message;
    }
    return `[${prefix}] ${message}`;
  }
}