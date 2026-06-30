import { Injectable } from '@nestjs/common';
import { InlineKeyboard, Keyboard } from 'grammy';
import { CTX } from 'src/bot/context';

@Injectable()
export class StartCommands
{
	async start(ctx: CTX)
	{
		await ctx.reply(ctx.t('start_text'));

		// Вставляешь сюда свой актуальный HTTPS URL от Cloudflare (или ngrok/mkcert)
		const webAppUrl = process.env.FRONTEND_URL ?? '';

		const inlineKeyboard = new InlineKeyboard()
			.webApp('Открыть Web App (Inline)', webAppUrl);

		const replyKeyboard = new Keyboard()
			.webApp('Запустить приложение (Reply)', webAppUrl)
			.resized();

		await ctx.reply('Привет! Выбирай удобный способ запуска мини-приложения:', {
			reply_markup: inlineKeyboard,
		});
	}
}
