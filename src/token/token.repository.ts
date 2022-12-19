import { Token } from './token.model';
import { ITokenRepository } from './token.repository.interface';
class TokenRepository implements ITokenRepository {
    async findTokenByUserId(userId: number): Promise<Token | null> {
        const token = await Token.findOne({where: {userId}})
        return token
    }

    async createToken(refresh: string, userId: number): Promise<Token> {
        const token = await Token.create({token: refresh, userId})
        return token
    }

    async findToken(refreshToken: string): Promise<Token | null> {
        const token = await Token.findOne({where: {token: refreshToken}})
        return token
    }

    async removeToken(refreshToken: string): Promise<void> {
        await Token.destroy({where: {token: refreshToken}})
    }

    async deleteTokenByIdUser(id: number): Promise<void> {
        await Token.destroy({where: {userId: id}})
    }
}

export const tokenRepository = new TokenRepository()