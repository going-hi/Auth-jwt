import { Model, Table, DataType, Column, HasOne } from "sequelize-typescript";
import { Token } from "../token/token.model";

interface CreateUserAttrs {
    email: string
    password: string
    activateLink: string
}

@Table({tableName: 'users'})
export class User extends Model<User, CreateUserAttrs> {

    @Column({type: DataType.STRING, unique: true, allowNull: false})
    declare email: string

    @Column({type: DataType.STRING, allowNull: false})
    declare password: string

    @Column({type: DataType.STRING, allowNull: false})
    declare activateLink: string

    @Column({type: DataType.BOOLEAN, defaultValue: false })
    declare isAuth: boolean

    @Column({type: DataType.BOOLEAN, defaultValue: false})
    declare isConfirmation: boolean

    @Column({type: DataType.INTEGER,  allowNull: true,  unique: true})
    declare code: number | null

   @HasOne(() => Token)
    token: Token
}
