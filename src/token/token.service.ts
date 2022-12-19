import { ITokenService } from './token.service.interface';
import { configService } from '../config/config.service';
import { Tokens } from './dto/tokens.dto';
import { UserDto } from '../auth/dto/user.dto';
import { JwtPayload, sign, verify} from 'jsonwebtoken'
import { tokenRepository } from './token.repository';



class TokenService implements ITokenService {
    private readonly SECRET_KEY_ACCESS: string
    private readonly SECRET_KEY_REFRESH: string
    constructor() {
        this.SECRET_KEY_ACCESS = configService.get('SECRET_ACCESS_TOKEN')
        this.SECRET_KEY_REFRESH = configService.get('SECRET_REFRESH_TOKEN')
    }

    generateTokens(dto: UserDto): Tokens {
        const accessToken = sign({...dto}, this.SECRET_KEY_ACCESS, {expiresIn: '1h'})
        const refreshToken = sign({...dto}, this.SECRET_KEY_REFRESH, {expiresIn: '60 days'})

        return {
            accessToken, refreshToken
        }
    }


    async saveToken(refreshToken: string, id: number): Promise<void> {
        const token = await tokenRepository.findTokenByUserId(id)

        if(token) {
            token.token = refreshToken
            await token.save()
            return
        }
        await tokenRepository.createToken(refreshToken, id)
    }

    async findToken(refreshToken: string) {
        const token = await tokenRepository.findToken(refreshToken)
        return token
    }

    validateRefreshToken(token: string): string | JwtPayload | null {
        try {
            const data = verify(token, this.SECRET_KEY_REFRESH )
            return data
        }catch(e) {
            return null
        }
    }

    validateAccessToken(token: string): string | JwtPayload | null {
        try {
            const data = verify(token, this.SECRET_KEY_ACCESS )
            return data
        }catch(e) {
            return null
        }
    }

    async removeToken(refresh: string): Promise<void>{
        await tokenRepository.removeToken(refresh)
    }
}



export const tokenService = new TokenService()