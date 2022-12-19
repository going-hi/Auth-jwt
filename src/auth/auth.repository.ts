import { IAuthRepository } from './auth.repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.model';
import { tokenRepository } from '../token/token.repository';


class AuthRepository implements IAuthRepository{
    async findUserByEmail(email: string): Promise<User | null> {
        const user = await User.findOne({where: {email}})
        return user
    }

    async createUser(userDto: CreateUserDto): Promise<User> {
        const user = await User.create(userDto)
        return user
    }

    async findUserById(id: number): Promise<User | null> {
        const user = await User.findByPk(id)
        return user
    }

    async findUserByLink(link: string): Promise<User | null> {
        const user = await User.findOne({where: {activateLink: link}})
        return user
    }

    async deleteUserById(id: number): Promise<void> {
        await tokenRepository.deleteTokenByIdUser(id)
        await User.destroy({where: {id}})
    }

    async findUserByCode(code:number): Promise<User | null> {
        const user = await User.findOne({where: {code}})
        return user
    }

    async getAllUsers(): Promise<User[] | null> {
        const users = await User.findAll()
        return users
    }
}

export const authRepository = new AuthRepository()