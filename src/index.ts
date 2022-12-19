import {app} from './app'
import { loggerService } from "./logger/logger.service";
import { DataBase } from './app';

async function start() {
    try {
        await DataBase.authenticate()
        app.start()
        return app.application
    }catch(e) {
        loggerService.error(e)
    }
}

start()
