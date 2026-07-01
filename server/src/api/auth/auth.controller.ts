import { Body, Controller, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TelegramLoginDto } from './dto/telegram-login.dto';

@Controller('api/auth')
export class AuthController
{
	private readonly logger = new Logger(AuthController.name);
	constructor(private readonly authService: AuthService)
	{}

	@Post('telegram-login')
	async login(@Body() dto: TelegramLoginDto)
	{
		const t = await this.authService.telegramLogin(dto.initData);
		return t;
	}
}
