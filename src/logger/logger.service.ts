import { ILogger } from "./logger.interface";
import {Logger} from 'tslog'

class LoggerService implements ILogger {
    logger: Logger

    constructor() {
        this.logger = new Logger({
            displayFilePath: 'hidden',
            displayInstanceName: false,
            displayFunctionName: false
        })
    }
    log(...args: unknown[]): void {
        this.logger.info(...args)
    }
    warn(...args: unknown[]): void {
        this.logger.warn(...args)
    }

    error(...args: unknown[]): void {
        this.logger.error(...args)
    }

}

export const loggerService = new LoggerService()