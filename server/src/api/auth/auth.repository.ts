import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthRepository
{
	constructor(
		private readonly prisma: PrismaService,
	)
	{}

	public async findOrCreateUser(telegramId: number)
	{
		return await this.prisma.user.upsert({
			where: {
				telegramId: telegramId,
			},
			update: {}, // Ничего не обновляем, если пользователь уже существует
			create: {
				telegramId: telegramId,
			},
		});
	}
}
