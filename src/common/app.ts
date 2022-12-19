import { IController } from './controller.interface';
import express, { Router, Application } from 'express';
import { loggerService } from '../logger/logger.service';
import { ExceptionMiddleware } from '../middlewares/exception.middleware';
import cookieParser from 'cookie-parser';
import { AuthMiddleware } from '../middlewares/auth.middleware';
export class App {
    application: Application = express()
    port: number
    controller: IController[]
    private router: Router = Router()
    constructor(port: number, controllers: IController[]) {
        this.port = port
        this.controller = controllers

        this.initializeMiddlewares()
        this.initializeController(controllers)
        this.application.use('/api', this.router)
        this.initializeExceptionMiddleware()
    }

    private initializeController(controllers: IController[]) {
        controllers.forEach(controller => this.router.use(controller.path, controller.router))
    }

    private initializeMiddlewares() {
        this.application.use(express.json())
        this.application.use(express.urlencoded({extended: false}))
        this.application.use(cookieParser())
        this.application.use(new AuthMiddleware().execute)
    }

    public start() {
        this.application.listen(this.port, () => loggerService.log(`[App] Server started on port ${this.port}`))
    }

    private initializeExceptionMiddleware() {
        this.application.use(new ExceptionMiddleware().execute)
    }
}