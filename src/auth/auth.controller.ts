import { BaseController } from "../common/base.controller";
import { IController } from "../common/controller.interface";
import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { authService } from './auth.service';
import { configService } from '../config/config.service';
import { ValidateMiddleware } from '../middlewares/validate.middleware';
import { DeleteUserDto } from "./dto/delete-user.dto";
import { AuthGuard } from "../middlewares/auth.guard";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ForgotPasswordCodeDto } from './dto/forgot-password-code.dto';



class AuthController extends BaseController implements IController  {
    path: string;
    constructor(){
        super()

        this.path = '/auth'
        this.bindRouters([
            {func: this.login, path: '/login', method: 'post', middlewares: [new ValidateMiddleware(CreateUserDto)]},
            {func: this.registration, path: '/registration', method: 'post', middlewares: [new ValidateMiddleware(CreateUserDto)]},
            {func: this.logout, path: '/logout', method: 'get'},
            {func: this.refresh, path: '/refresh', method: 'get'},
            {func: this.activateLink, path: '/active/:link', method: 'get'},
            {func: this.delete, path: '/', method: 'delete', middlewares: [new ValidateMiddleware(DeleteUserDto), new AuthGuard()]},
            {func: this.forgotPassword, path: '/forgotPassword', method: 'post', middlewares: [new ValidateMiddleware(ForgotPasswordDto)]},
            {func: this.codeForgotPassword, path: '/codeforgotPassword', method: 'post', middlewares: [new ValidateMiddleware(ForgotPasswordCodeDto)]},
            {func: this.testGetAllUsers, path: '/users', method: 'get', middlewares: [new AuthGuard()]}
        ])
    }


    private async login(req: Request<{}, {}, Pick<CreateUserDto, 'email' | 'password'>>, res: Response, next: NextFunction) {
        try {
            const userBody = req.body
            const userDtoAndTokens = await authService.login(userBody)
            this.setCookieToken(res, userDtoAndTokens.tokens.refreshToken)
            this.ok(res, userDtoAndTokens)
        }catch(e) {
            next(e)
        }
    }



    private async registration(req: Request<{}, {}, Pick<CreateUserDto, 'email' | 'password'>>, res: Response, next: NextFunction) {
        try {
            const userBody = req.body
            const userDtoAndTokens = await authService.registration(userBody)
            this.setCookieToken(res, userDtoAndTokens.tokens.refreshToken)
            this.created(res, userDtoAndTokens)
        } catch(e) {
            console.log(e);
            next(e)
        }
    }

    private async delete(req: Request<{}, {}, {password: string}>, res: Response, next: NextFunction) {
        try {
            const {password} = req.body
            const user = req.user
            await authService.delete(user.id, password)
            res.clearCookie('refreshToken')
            this.send(res, 204)
        } catch(e) {
            next(e)
        }
    }
    private async activateLink(req: Request<{link: string}>, res: Response, next: NextFunction) {
        try {
            const {link} = req.params
            await authService.activateLink(link)
            res.redirect(`https://${configService.get('REDIRECT')}`)
        } catch(e) {
            next(e)
        }
    }
    private async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const {refreshToken} = req.cookies
            await authService.logout(refreshToken)
            res.clearCookie('refreshToken')
            this.send(res, 204)
        } catch(e) {
            next(e)
        }
    }
    private async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const {refreshToken} = req.cookies
            console.log(refreshToken);
            const userDtoAndTokens = await authService.refresh(refreshToken)
            this.setCookieToken(res, userDtoAndTokens.tokens.refreshToken)
            this.ok(res, userDtoAndTokens)
        } catch(e) {
            next(e)
        }
    }


    private async forgotPassword(req: Request<{},{},{email: string}>, res:Response, next:NextFunction) {
        try {
            const {email} = req.body
            await authService.forgotPassword(email)
            this.send(res, 204)
        }catch(e) {
            next(e)
        }
    }

    private async codeForgotPassword(req: Request<{}, {}, {code: number, password: string}>, res: Response, next: NextFunction) {
        try {
            const {code, password} = req.body
            await authService.codeForgotPassword(code, password)
            this.send(res, 204)
        }catch(e) {
            next(e)
        }
    }

    //* jwt token access
    private async testGetAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await authService.testGetAllUsers()
            this.ok(res, users)
        }catch(e) {
            next(e)
        }
    }

    private async setCookieToken(res: Response, token: string) {
        res.cookie('refreshToken', token, {
            httpOnly: true,
            maxAge: 60 * 24 * 60 * 60 * 1000
        })
    }

}


export const authController = new AuthController()