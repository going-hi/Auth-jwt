import { App } from "./common/app";
import { configService } from "./config/config.service";
import { authController } from './auth/auth.controller';
import { databaseService } from './dataBase/database.service';
import { Token } from './token/token.model';
import { User } from './auth/user.model';

const PORT = Number(configService.get('PORT'))



databaseService.addModels(Token, User)

export const DataBase = databaseService


export const app = new App(PORT, [
    authController
]);
