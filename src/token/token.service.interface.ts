import { Tokens } from './dto/tokens.dto';
import { UserDto } from '../auth/dto/user.dto';
import { Token } from './token.model';
export interface ITokenService {
    generateTokens(dto: UserDto): Tokens
    findToken(refreshToken: string): Promise<Token | null>
    saveToken(refreshToken: string, id: number): Promise<void>
}