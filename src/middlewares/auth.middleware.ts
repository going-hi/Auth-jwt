import { Request, Response, NextFunction } from 'express';
import { IMiddlleware } from './middleware.interface';
import { tokenService } from '../token/token.service';
import { UserDto } from '../auth/dto/user.dto';



export class AuthMiddleware implements IMiddlleware {

    execute(req: Request, res: Response, next: NextFunction):void {
        const authorization = req.headers.authorization
        if(!authorization) {
            return next()
        }
        const [type, token] = authorization.split(' ')
        if(type !== 'Bearer' || !token) {
            return next()
        }
        const userData = <UserDto>tokenService.validateAccessToken(token)
        if(!userData) {
            return next()
        }
        req.user = userData
        next()
    }
}