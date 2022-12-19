import { Token } from "./token.model";

export interface ITokenRepository {
    findTokenByUserId(userId: number): Promise<Token | null>
    findToken(refreshToken: string): Promise<Token | null>
    removeToken(refreshToken: string): Promise<void>
    deleteTokenByIdUser(id: number): Promise<void>
}