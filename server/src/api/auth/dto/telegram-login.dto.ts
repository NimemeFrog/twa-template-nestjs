import { IsNotEmpty, IsString } from 'class-validator';

export class TelegramLoginDto
{
    @IsString({ message: 'Field initData must be a string' })
    @IsNotEmpty({ message: 'Field initData must not be empty' })
    initData!: string;
}