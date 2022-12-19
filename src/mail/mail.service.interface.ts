export interface IMailService {
    sendMessagesLink(to: string, link: string): Promise<void>
    sendCode(to: string, code: number): Promise<void>
}