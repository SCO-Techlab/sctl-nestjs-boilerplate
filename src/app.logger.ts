import { Injectable } from '@nestjs/common';
import { DATE_PATTERNS, MAGIC_NUMBERS } from '@shared/constants';
import { LOGGER_TYPE } from '@shared/enums';
import { createLogger, format, Logger, transports } from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class AppLogger {

  private loggerInfo: Logger;
  private loggerError: Logger;
  private loggerAll: Logger;

  private dateFormat = format.timestamp({ format: DATE_PATTERNS.DATETIME });
  private textFormat = format.printf((log) => {
    return `${log.timestamp} - [${log.level.toUpperCase().charAt(MAGIC_NUMBERS.N_0)}] ${log.message}`;
  });

  constructor() {
    this.createLoggers();
    this.replaceConsole();
  }

  createLoggers() {
    this.loggerInfo = this.createLoggerObject(LOGGER_TYPE.INFO);
    this.loggerError = this.createLoggerObject(LOGGER_TYPE.ERROR);
    this.loggerAll = this.createLoggerObject(LOGGER_TYPE.ALL);
  }

  replaceConsole() {
    console.log = (message: any, params: any) => {
      if (params) {
        this.loggerInfo.info(message + " " + JSON.stringify(params));
        this.loggerAll.info(message + " " + JSON.stringify(params));
      } else {
        this.loggerInfo.info(message);
        this.loggerAll.info(message);
      }
    }

    console.error = (message: any, params: any) => {
      if (params) {
        this.loggerError.error(message + " " + JSON.stringify(params));
        this.loggerAll.error(message + " " + JSON.stringify(params));
      } else {
        this.loggerError.error(message);
        this.loggerAll.error(message);
      }
    }
  }

  /* This methods are necessary to avoid circular dependency */
  log(message: string) {
    this.loggerInfo.info(message);
    this.loggerAll.info(message);
  }

  error(message: string) {
    this.loggerError.error(message);
    this.loggerAll.error(message);
  }

  warn() { }

  debug() { }

  verbose() { }

  private createLoggerObject(name: string): any {
    const logger: any = {
      format: format.combine(
        this.dateFormat,
        this.textFormat
      ),
      transports: [
        new transports.DailyRotateFile({
          filename: `log/${name}/${name}-%DATE%.log`,
          datePattern: DATE_PATTERNS.DATE,
          maxFiles: `${MAGIC_NUMBERS.N_7}` // or 7d
        })
      ]
    };

    if (name === LOGGER_TYPE.ALL) {
      logger.transports.push(new transports.Console());
    } else {
      logger.name = name;
    }

    return createLogger(logger);
  }
}