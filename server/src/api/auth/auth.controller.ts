import { Body, Controller, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController
{
	private readonly logger = new Logger(AuthController.name);
	constructor(private readonly authService: AuthService)
	{}

	@Post('telegram-login')
	async login(@Body('initData') initData: string)
	{
		this.logger.debug(`Получен запрос. initData: ${initData}`);
		const t = await this.authService.telegramLogin(initData);
		this.logger.debug(t);
		return t;
	}
}
