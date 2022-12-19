import { NextFunction, Request, Response } from "express";

export interface IMiddlleware {
    execute: <T extends Request>(req: T, res:Response, next: NextFunction ) => void
}