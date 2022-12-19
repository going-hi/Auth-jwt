import request, { Response } from "supertest"
import {app, DataBase} from '../src/app'
import { authService } from '../src/auth/auth.service';
import { authRepository } from '../src/auth/auth.repository';

const App = app.application

const API_PATH = '/api/auth'

const TESTDATA = {
    correctEmail: 'example@gmail.com',
    correctPassword: 'qwertyu',
    nocorrectEmail: 'emaidak',
    nocorrectPassword: '112',

    loginEmail: 'example@gmail.com',
    registrationEmail: 'registra@gmail.com',
    LoginAndRegistrpassword: 'qwertylogin',

}

const REGEX_JWT = /^[\w-]*\.[\w-]*\.[\w-]*$/

async function deleteUser(email: string) {
    const user = await authRepository.findUserByEmail(email)
    console.log(user);
    if(user) {
        await authService.delete(user.id, TESTDATA.LoginAndRegistrpassword)
    }
}

function cookieParse(response: request.Response, key: string = 'refreshToken') {
        const cookieHeader = response.headers['set-cookie']
        const arrCookie = cookieHeader[0].split(';')
        let tokenCookie = ''
        arrCookie.forEach((a: string) => {
            if(a.startsWith(key + '=')) {
                tokenCookie = a
            }
        });
        const [_, value] = tokenCookie?.split('=')
        return value
}


beforeAll(async () => {
    await DataBase.authenticate()
})

afterAll(async () => {
    await DataBase.disconnect()
})

describe('/registration', () => {
    const email = TESTDATA.registrationEmail
    const password = TESTDATA.LoginAndRegistrpassword

    beforeAll(async () => {
        await deleteUser(email)
    })

    it('should return user data and tokens, set cookie', async () => {
        const response = await request(App)
        .post(API_PATH + '/registration')
        .send({email, password})
        .expect(201)

        const user = response.body
        //* get cookie
        const value = cookieParse(response)

        expect(user).toEqual({
            user: {
                id: expect.any(Number),
                isAuth: expect.any(Boolean),
                email: TESTDATA.registrationEmail
            },
            tokens: {
                accessToken: expect.any(String),
                refreshToken: expect.any(String),
            }
        })
        //* check jwt
        expect(user.tokens.accessToken).toMatch(REGEX_JWT)
        expect(user.tokens.refreshToken).toMatch(REGEX_JWT)

        expect(value).toMatch(REGEX_JWT)
    })
    it("shouldn’t return user", async () => {
        // * user with this email already exists
        await request(App)
        .post(API_PATH + '/registration')
        .send({email, password})
        .expect(400)
    })


    it('test validation', async () => {
        await request(App)
        .post(API_PATH + '/registration')
        .send({email: TESTDATA.nocorrectEmail, password: TESTDATA.nocorrectPassword})
        .expect(400)

        await request(App)
        .post(API_PATH + '/registration')
        .send({})
        .expect(400)
    })

})

describe('/login', () => {
    const email = TESTDATA.loginEmail
    const password = TESTDATA.LoginAndRegistrpassword

    beforeAll(async () => {
        await deleteUser(email)
        await request(App)
        .post(API_PATH + '/registration')
        .send({email, password})
    })

    it('should return user data and tokens, set cookie', async () => {
        const response = await request(App)
        .post(API_PATH + '/login')
        .send({email, password})
        .expect(200)

        const user = response.body
        const value = cookieParse(response)

        expect(user).toEqual({
            user: {
                id: expect.any(Number),
                isAuth: expect.any(Boolean),
                email
            },
            tokens: {
                accessToken: expect.any(String),
                refreshToken: expect.any(String),
            }
        })

        //* check jwt
        expect(user.tokens.accessToken).toMatch(REGEX_JWT)
        expect(user.tokens.refreshToken).toMatch(REGEX_JWT)


        expect(value).toMatch(REGEX_JWT)
    })

    it("shouldn’t return user", async () => {

        // * invalid password
        await request(App)
        .post(API_PATH + '/login')
        .send({email, password: 'randompasswordtest'})
        .expect(400)


        // * user with this email is not
        await request(App)
        .post(API_PATH + '/login')
        .send({email: '121d@gmail.com', password})
        .expect(400)
    })

    it('test validation', async () => {
        await request(App)
        .post(API_PATH + '/login')
        .send({email: TESTDATA.nocorrectEmail, password: TESTDATA.nocorrectPassword})
        .expect(400)

        await request(App)
        .post(API_PATH + '/login')
        .send({})
        .expect(400)
    })

})


describe('/logout', () => {
    it('should return 204', async () => {
        const response = await request(App)
        .get(API_PATH + '/logout')
        .expect(204)

        // * get cookie
        const value = cookieParse(response)

        expect(value).toBe('')
    })
})


describe('/refresh', () => {
    const email = TESTDATA.registrationEmail
    const password = TESTDATA.LoginAndRegistrpassword

    beforeAll(async () => {
        await deleteUser(email)
    })


    it('should return user data and tokens, set cookie', async () =>{
        const {body} =  await request(App)
        .post(API_PATH + '/registration')
        .send({email, password})

        const token = body.tokens.refreshToken

        const response = await request(App)
        .get(API_PATH + '/refresh')
        .set('Cookie', [`refreshToken=${token}`])
        .expect(200)


        const bodyResponse = response.body
        const value = cookieParse(response)

        expect(bodyResponse).toEqual({
            user: {
                id: body.user.id,
                isAuth: body.user.isAuth,
                email: body.user.email
            },
            tokens: {
                accessToken: expect.any(String),
                refreshToken: expect.any(String),
            }
        })

        expect(value).toBe(bodyResponse.tokens.refreshToken)
    })

    it("shouldn't return user data", async () => {
        await request(App)
        .get(API_PATH + '/refresh')
        .expect(401)
    })

})


describe('/delete', () => {
    const email = TESTDATA.registrationEmail
    const password = TESTDATA.LoginAndRegistrpassword

    beforeAll(async () => {
        await deleteUser(email)
    })

    it('should delete user and return status code 204', async () => {
        const {body} =  await request(App)
        .post(API_PATH + '/registration')
        .send({email, password})

        await request(App)
        .delete(API_PATH + '/')
        .auth(body.tokens.accessToken, {type: 'bearer'})
        .send({password})
        .expect(204)

        await request(App)
        .post(API_PATH + '/login')
        .send({email, password})
        .expect(400)

    })

    it('should return status code 401', async () => {
        await request(App)
        .delete(API_PATH + '/')
        .auth('sdf', {type: 'bearer'})
        .send({password})
        .expect(401)
    })

    it('should return status code 400', async () => {
        const {body} =  await request(App)
        .post(API_PATH + '/registration')
        .send({email, password})


        //* invalid password
        await request(App)
        .delete(API_PATH + '/')
        .auth(body.tokens.accessToken, {type: 'bearer'})
        .send({password: 'randompassword'})
        .expect(400)
    })
})


describe('/forgotPassword', () => {
    const email = TESTDATA.loginEmail
    const password = TESTDATA.LoginAndRegistrpassword

    beforeAll(async () => {
        await deleteUser(email)
        await request(App)
        .post(API_PATH + '/registration')
        .send({email, password})
    })

    it('should return status code 204', async () => {
         await request(App)
         .post(API_PATH + '/forgotPassword')
         .send({email})
         .expect(204)

        const user = await authRepository.findUserByEmail(email)
        const type = typeof Number(user?.code)
        expect(type).toBe('number')
    })

    it('should return status code 400', async () => {
        await deleteUser(email)

        await request(App)
        .post(API_PATH + '/forgotPassword')
        .send({email})
        .expect(400)
    })

})


describe('/activateLink', () => {

    const email = TESTDATA.registrationEmail
    const password = TESTDATA.LoginAndRegistrpassword

    beforeAll(async () => {
        await deleteUser(email)
    })

    it('should field isAuth is true', async () => {

        const data = await request(App)
                        .post(API_PATH + '/registration')
                        .send({email, password})

        expect(data.body.user.isAuth).toBe(false)

        const user = await authRepository.findUserByEmail(email)
        const activeLink = user?.activateLink
        await request(App)
        .get(`${API_PATH}/active/${activeLink}`)


        const bodyUser = await request(App)
        .post(API_PATH + '/login')
        .send({email, password})

        expect(bodyUser.body.user.isAuth).toBe(true)
    })
})


describe('/codeForgotPassword', () => {
    const email = TESTDATA.registrationEmail
    const password = TESTDATA.LoginAndRegistrpassword

    beforeAll(async () => {
        await deleteUser(email)
        await request(App)
        .post(API_PATH + '/registration')
        .send({email, password})
    })
    it('should return status code 204', async () => {
        await request(App)
        .post(API_PATH + '/forgotPassword')
        .send({email})
        .expect(204)

        const user = await authRepository.findUserByEmail(email)

        await request(App)
        .post(API_PATH + '/codeForgotPassword')
        .send({code: user?.code, password})
        .expect(204)
    })

    it('should return status code 400', async () => {
        await request(App)
        .post(API_PATH + '/codeForgotPassword')
        .send({code: '123456', password})
        .expect(400)
    })

    it('should return status code 400/ test validation', async () => {
        await request(App)
        .post(API_PATH + '/codeForgotPassword')
        .send({code: 'random2123', password: TESTDATA.nocorrectPassword})
        .expect(400)
    })
})



describe('/users', () => {

    const email = TESTDATA.registrationEmail
    const password = TESTDATA.LoginAndRegistrpassword

    beforeAll(async () => {
        await deleteUser(email)
    })

    it('should return 200 and array users', async () => {
        const {body} =  await request(App)
        .post(API_PATH + '/registration')
        .send({email, password})

        const token = body.tokens.accessToken

        await request(App)
        .get(API_PATH + '/users')
        .auth(token, {type: 'bearer'})
        .send({password})
        .expect(200)

    })
    it('should return 401', async () => {
        await request(App)
        .get(API_PATH + '/users')
        .expect(401)
    })

})
