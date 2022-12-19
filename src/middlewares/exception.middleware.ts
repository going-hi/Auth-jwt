import { Request, Response, NextFunction , ErrorRequestHandler} from 'express';
import {loggerService} from '../logger/logger.service'
import { HttpException } from '../exception/exception.error';
export class ExceptionMiddleware{

    execute(err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction): void {

            if(err instanceof HttpException) {
                loggerService.error(`[${err.status}] ${err.message}`, err.errors)
                res.status(err.status).json({message: err.message, err: err.errors})
                return
            }

            loggerService.error(err)
            res.status(500).json({message: 'Ошибка сервера'})
    }
}