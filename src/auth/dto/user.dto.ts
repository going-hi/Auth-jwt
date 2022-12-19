import { User } from "../user.model";

export class UserDto {

    id: number
    email: string
    isAuth: boolean

    constructor(user: User) {
        this.email = user.email
        this.id = user.id
        this.isAuth = user.isAuth
    }
}