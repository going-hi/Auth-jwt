import { MaxLength, MinLength } from "class-validator";

export class DeleteUserDto {

    @MinLength(6)
    @MaxLength(20)
    readonly password: string
}