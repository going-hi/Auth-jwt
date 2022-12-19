import { plainToClass } from 'class-transformer';
import { Request, Response, NextFunction } from 'express';
import {validate} from 'class-validator'

import { IMiddlleware } from './middleware.interface';
import { HttpException } from '../exception/exception.error';
export class ValidateMiddleware<T extends object> implements IMiddlleware {

    classDto: new (...args: any[]) => T


    constructor(classDto: new (...args: any[]) => T) {
        this.classDto = classDto
    }
    async execute(req: Request, res: Response, next: NextFunction):Promise<void> {
        console.log(req.body);
        const plain = plainToClass(this.classDto, req.body)
        const errors = await validate(plain)
        if(errors.length) {
            return next(HttpException.BadRequest('Ошибка в валидации', errors))
        }
        next()
    }
}