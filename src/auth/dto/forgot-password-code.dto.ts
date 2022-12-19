import { Type } from 'class-transformer';
import {IsNumber, Max, MaxLength, Min, MinLength } from 'class-validator';

export class ForgotPasswordCodeDto {

    @MinLength(6)
    @MaxLength(20)
    readonly password: string

    @IsNumber()
    @Type(() => Number)
    @Min(100000)
    @Max(999999)
    readonly code: number
}