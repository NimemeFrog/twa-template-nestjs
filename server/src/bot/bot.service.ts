import { RedisAdapter } from '@grammyjs/storage-redis';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot, session } from 'grammy';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
import { StartComposer } from './commands/start/start.composer';
import { CTX, SessionData } from './context';
import { I18nService } from './i18n.service';

@Injectable()
export class BotService implements OnModuleInit
{
	private readonly bot: Bot<CTX>;
	private readonly logger = new Logger(BotService.name);

	constructor(
		private readonly configService: ConfigService,
		private readonly i18nService: I18nService,
		// Composers
		private readonly startComposer: StartComposer,
	)
	{
		const token = this.configService.getOrThrow<string>('BOT_TOKEN');

		this.bot = new Bot<CTX>(token);

		const redisInstance = new Redis(
			`redis://${this.configService.get<string>('REDIS_HOST')}:${
				this.configService.get<number>('REDIS_PORT')
			}`,
		);

		this.bot.use(session({
			initial: (): SessionData => ({
				__language_code: undefined,
			}),
			storage: new RedisAdapter({ instance: redisInstance }),
			getSessionKey: (ctx) =>
			{
				if (ctx.from?.id)
				{
					return ctx.from.id.toString();
				}

				return undefined;
			},
		}));

		this.bot.use(this.i18nService.getMiddleware());

		this.bot.use(this.startComposer.composer);

		this.bot.catch(async (err) =>
		{
			const ctx = err.ctx;
			this.logger.error('Ошибка:', err.error);
			await ctx.reply(ctx.t('auth_system_error'));
		});
	}

	onModuleInit()
	{
		this.start();
	}

	public start()
	{
		this.bot.start({
			onStart: (botInfo) =>
			{
				console.log(`Bot @${botInfo.username} started successfully!`);
			},
		});
	}
}
