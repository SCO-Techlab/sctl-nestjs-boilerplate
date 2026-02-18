import { Inject, Injectable } from '@nestjs/common';
import { DATE_PATTERNS, MAGIC_NUMBERS } from '@shared/constants';
import { PROVIDER_CONFIG } from '@shared/helpers';
import { createLogger, format, Logger, transports } from 'winston';
import 'winston-daily-rotate-file';

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'verbose' | 'all';

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

  log(message: string) {
    this.write('info', message);
  }

  warn(message: string) {
    this.write('warn', message);
  }

  error(message: string) {
    this.write('error', message);
  }

  debug(message: string) {
    this.write('debug', message);
  }

  verbose(message: string) {
    this.write('verbose', message);
  }

  private createLoggers() {
    Object.values(this.LEVELS).forEach(level => {
      this.loggers.set(level, this.createLoggerObject(level));
    });
  }

  private replaceConsole() {
    console.log = this.createConsoleWrapper('info');
    console.info = this.createConsoleWrapper('info');
    console.warn = this.createConsoleWrapper('warn');
    console.error = this.createConsoleWrapper('error');
    console.debug = this.createConsoleWrapper('debug');
    console.trace = this.createConsoleWrapper('verbose');
  }

  private createConsoleWrapper(level: LogLevel) {
    return (...args: any[]) => {
      const message = args
        .map(arg =>
          typeof arg === 'string' ? arg : JSON.stringify(arg),
        )
        .join(' ');

      this.write(level, message);
    };
  }

  private write(level: LogLevel, message: string) {
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
}