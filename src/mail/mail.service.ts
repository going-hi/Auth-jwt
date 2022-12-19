import { IMailService } from "./mail.service.interface";
import {createTransport, Transporter} from 'nodemailer'
import { configService } from '../config/config.service';
import { IConfigService } from '../config/config.service.interface';


class MailService implements IMailService {
    private transport: Transporter

    constructor(private readonly config: IConfigService = configService) {

        const {NM_HOST, NM_PASS, NM_PORT, NM_USER} = this.envVar()

        this.transport = createTransport({
            host: NM_HOST,
            port: Number(NM_PORT),
            secure: false,
            auth: {
                user: NM_USER,
                pass: NM_PASS
            },
        })
    }

    private envVar() {
        const NM_HOST = this.config.get('NM_HOST')
        const NM_PORT = this.config.get('NM_PORT')
        const NM_USER = this.config.get('NM_USER')
        const NM_PASS = this.config.get('NM_PASS')
        const API = this.config.get('API')
        const PORT = this.config.get('PORT')
        return {
            NM_HOST, NM_PASS, NM_PORT, NM_USER, API, PORT
        }
    }

    async sendMessagesLink(to: string, link: string): Promise<void> {
        const {NM_USER, PORT, API} = this.envVar()
        await this.transport.sendMail({
            to,
            from: NM_USER,
            subject: '',
            text: '',
            html: `
                <div>
                    <h1>Активация аккаунта на ${API}</h1>
                    <span>Нажми на ссылку чтобы активировать аккаунт</span>
                    <a href = 'http://${API}:${PORT}/api/auth/active/${link}'>Активировать</a>
                </div>
            `
        })
    }

    async sendCode(to: string, code: number): Promise<void> {
        const {NM_USER} = this.envVar()
        await this.transport.sendMail({
            to, from: NM_USER, subject: '', text: '',
            html: `
                <div>
                    <h1>Код для востановления пароля</h1>
                    <h1>${code}</h1>
                </div>
            `
        })
    }

}

export const mailService = new MailService()