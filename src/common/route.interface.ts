import { Router, NextFunction, Response, Request } from 'express';
import { IMiddlleware } from '../middlewares/middleware.interface';

export interface IControllerRoute {
    path: string
    method: keyof Pick<Router, 'get' | 'post' | 'put' | 'delete' | 'patch' >
    func: (req: Request, res: Response, next: NextFunction) => Promise<void> | void
    middlewares?: IMiddlleware[]
}

export type typeExpressRecord = Response<unknown, Record<string, unknown>>