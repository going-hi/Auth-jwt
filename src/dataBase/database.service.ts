import { loggerService } from '../logger/logger.service';
import { configService } from '../config/config.service';
import { Sequelize, Model, ModelCtor } from 'sequelize-typescript';



class DatabaseService {

    orm: Sequelize
    
    constructor(){

        const {database, username, password} = this.envVar()

        this.orm = new Sequelize({
            dialect: 'postgres',
            database,
            username,
            password
        })
    }


    public addModels(...models: ModelCtor<Model>[]) {
        this.orm.addModels(models)

        const modelsNames = models.map(model => model.tableName).join(', ')
        loggerService.log(`[DataBase] Models ${modelsNames} loaded`)
    }

    private envVar() {
        const database = configService.get('DB_NAME')
        const username = configService.get('DB_USERNAME')
        const password = configService.get('DB_PASSWORD')
        return {
            database, username, password
        }

    }

    public async authenticate() {
        try {
            await this.orm.sync()
            await this.orm.authenticate()
            loggerService.log('[DataBase] Connected successfully')
        }catch(e) {
            loggerService.error('[DataBase] ', e)
        }
    }

    public async disconnect() {
        await this.orm.close()
        loggerService.log('[DataBase] Successfully disabled')
    }
}

export const databaseService = new DatabaseService()

