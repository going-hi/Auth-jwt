import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from '../auth/user.model';

interface CreateTokenAttrs {
    token: string
    userId: number
}


@Table({tableName: 'token'})
export class Token extends Model<Token, CreateTokenAttrs> {

    @Column({type: DataType.STRING, allowNull: false})
    declare token: string

    @ForeignKey(() => User)
    @Column({type: DataType.INTEGER})
    declare userId: number

    @BelongsTo(() => User)
    user: User
}