import { IConfigService } from "./config.service.interface";
import { DotenvParseOutput, config } from "dotenv";
import { ILogger } from '../logger/logger.interface';
import { loggerService } from '../logger/logger.service';

class ConfigService implements IConfigService {
    private config!: DotenvParseOutput

    constructor(private logger: ILogger = loggerService) {
        const result = config()
        if(result.error) {
            this.logger.error('[ConfigService] Failed to read .env', result.error)
        }else {
            this.config = result.parsed as DotenvParseOutput
            this.logger.log('[ConfigService] .env config loaded successfully')
        }
    }

    get(key: string): string {
        return this.config[key]
    }

}

export const configService = new ConfigService()