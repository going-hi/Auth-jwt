import { Response, Router } from "express";
import { loggerService } from "../logger/logger.service";
import { IControllerRoute, typeExpressRecord } from "./route.interface";

export abstract class BaseController {
    private readonly _router: Router

    constructor() {
        this._router = Router()
    }

    get router() {
        return this._router
    }

    public ok<T>(res: Response, message: T): typeExpressRecord {
        return this.send<T>(res, 200, message)
    }

    public created<T>(res: Response, message: T): typeExpressRecord {
        return this.send<T>(res, 201, message)
    }

    public send<T>(res: Response, status: number, message?: T): typeExpressRecord {
        res.type('application/json')
        if(!message) {
            return res.sendStatus(status)
        }
        return res.status(status).json({...message})
    }

    protected bindRouters(routers: IControllerRoute[]) {
        routers.forEach(router => {
            loggerService.log(`[${router.method}] ${router.path}`)
            const middleware = router.middlewares?.map(func => func.execute.bind(func))
            const func = router.func.bind(this)
            const pipeline = middleware ? [...middleware, func] : func
            this._router[router.method](router.path, pipeline)
        })
    }
}