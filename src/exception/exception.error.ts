export class HttpException extends Error {
    status: number
    errors: any[]

    constructor(status: number,message: string, errors: any[] = []) {
        super(message)
        this.status = status
        this.errors = errors
    }


    static BadRequest(message: string, errors?: any[]): HttpException {
        return new HttpException(400,message, errors)
    }

    static Unauthorized(): HttpException {
        return new HttpException(401, 'Unauthorized',)
    }

    static NotFound(): HttpException {
        return new HttpException(404, 'Not Found')
    }

    static Forbidden(): HttpException {
        return new HttpException(403, 'Forbidden')
    }
}

