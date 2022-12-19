import { NextFunction, Response, Request } from 'express';
import { HttpException } from '../exception/exception.error';
import { IMiddlleware } from './middleware.interface';


export class AuthGuard implements IMiddlleware {

    execute({user}: Request, res: Response, next: NextFunction):void {
        if(!user) {
           return next(HttpException.Unauthorized())
        }
        next()
    }
}