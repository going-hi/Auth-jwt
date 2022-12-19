import { Tokens } from '../token/dto/tokens.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './user.model';

export interface resUserDto {user: UserDto, tokens: Tokens}

export interface IAuthService {
    login(userDto:  Pick<CreateUserDto, 'email' | 'password'>): Promise<resUserDto>
    registration(userDto:  Pick<CreateUserDto, 'email' | 'password'>): Promise<resUserDto>
    delete(id: number, password: string): Promise<void>
    activateLink(link: string): Promise<void>
    logout(refreshToken: string): Promise<void>
    refresh(refreshToken: string): Promise<resUserDto>
    forgotPassword(email: string): Promise<void>
    codeForgotPassword(code: number, newPassword: string): Promise<void>
    testGetAllUsers(): Promise<User[] | null>
}