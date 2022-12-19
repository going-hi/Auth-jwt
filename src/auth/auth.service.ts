import { IAuthService, resUserDto } from './auth.service.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { authRepository } from './auth.repository';
import {randomUUID} from 'crypto'
import bcrypt from 'bcrypt'
import { UserDto } from './dto/user.dto';
import { tokenService } from '../token/token.service';
import { User } from './user.model';
import { mailService } from '../mail/mail.service';
import { HttpException } from '../exception/exception.error';


class AuthService implements IAuthService{
    async login(dto:  Pick<CreateUserDto, 'email' | 'password'>): Promise<resUserDto> {
        const user = await authRepository.findUserByEmail(dto.email)
        if(!user) {
            throw HttpException.BadRequest('User with this email does not exist')
        }
        const compare = await bcrypt.compare(dto.password, user.password)
        if(!compare) {
           throw HttpException.BadRequest('Invalid password')
        }

        const {userDto, tokens} = this.userDtoAndTokensGenerate(user)

        await tokenService.saveToken(tokens.refreshToken, userDto.id)

        return {
            user: userDto, tokens
        }
    }

    async registration(dto:  Pick<CreateUserDto, 'email' | 'password'>): Promise<resUserDto> {
        const user = await authRepository.findUserByEmail(dto.email)
        if(user) {
           throw HttpException.BadRequest('User with this email already exists')
        }
        const hashPassword = await  bcrypt.hash(dto.password, 10)
        const activateLink = randomUUID()
        const createUser = await authRepository.createUser({...dto, password: hashPassword, activateLink})

        await mailService.sendMessagesLink(createUser.email, activateLink)

        const {userDto, tokens} = this.userDtoAndTokensGenerate(createUser)

        await tokenService.saveToken(tokens.refreshToken, userDto.id)

        return {
            user: userDto, tokens
        }
    }

    async activateLink(link: string): Promise<void> {
        const user = await authRepository.findUserByLink(link)
        if(user) {
            user.isAuth = true
            await user.save()
            return
        }
    }

    async delete(id: number, password: string): Promise<void> {
        const user = await authRepository.findUserById(id)
        if(!user) {
            throw HttpException.Unauthorized()
        }
        const check  =  await bcrypt.compare(password, user.password)
        if(!check) {
            throw HttpException.BadRequest('Invalid password')
        }
        await authRepository.deleteUserById(id)
    }

    async logout(refreshToken: string): Promise<void> {
        if(!refreshToken) {
            return
        }
        await tokenService.removeToken(refreshToken)
    }

    async refresh(refreshToken: string): Promise<resUserDto> {
        if(!refreshToken) {
            throw HttpException.Unauthorized()
        }
        const userData = tokenService.validateRefreshToken(refreshToken)
        console.log(userData);
        const token = await tokenService.findToken(refreshToken)
        console.log(token);

        if(!token || !userData) {
            throw HttpException.Unauthorized()
        }
        const user = await authRepository.findUserById(token.userId)

        if(!user) {
            throw HttpException.Unauthorized()
        }
        const {userDto, tokens} = this.userDtoAndTokensGenerate(user)
        await tokenService.saveToken(tokens.refreshToken, userDto.id)
        return {
            user: userDto, tokens
        }
    }


    private userDtoAndTokensGenerate(user: User) {
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens(userDto)

        return  {
            userDto, tokens
        }
    }

    async forgotPassword(email: string): Promise<void> {
        const user = await authRepository.findUserByEmail(email)
        if(!user) {
            throw HttpException.BadRequest('User with this email does not exist')
        }
        const code = this.getCodeRandom()
        user.code = code
        await user.save()
        await mailService.sendCode(email, code)
    }

    async codeForgotPassword(code: number, newPassword: string): Promise<void> {
        const user = await authRepository.findUserByCode(code)
        if(!user) {
            throw HttpException.BadRequest('Invalid code')
        }
        const newpasswordHash = await bcrypt.hash(newPassword, 10)
        user.password = newpasswordHash
        user.code = null
        await user.save()
    }

    async testGetAllUsers(): Promise<User[] | null> {
        const users = await authRepository.getAllUsers()
        return users
    }

    private getCodeRandom() {
        return Math.floor(Math.random() * (999999-100000) + 1000)
    }
}




export const authService = new AuthService()