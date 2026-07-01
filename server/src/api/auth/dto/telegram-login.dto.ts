import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class TelegramLoginDto
{
    @IsString({ message: 'Field initData must be a string' })
    @IsNotEmpty({ message: 'Field initData must not be empty' })
    @MaxLength(2000, { message: 'Длина initData превышает допустимую' })
    initData!: string;
}