import { IsEmail,MaxLength, MinLength } from "class-validator"

export class CreateUserDto {
    @IsEmail()
    readonly email: string

    @MinLength(6)
    @MaxLength(20)
    readonly password: string

    readonly activateLink: string
}