import { User } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';

export interface IAuthRepository {
    findUserByEmail(email: string): Promise<User | null>
    createUser(userDto: CreateUserDto): Promise<User>
    findUserById(id: number): Promise<User | null>
    findUserByLink(link: string): Promise<User | null>
    deleteUserById(id: number): Promise<void>
    findUserByCode(code: number): Promise<User | null>
    getAllUsers(): Promise<User[] | null>
}