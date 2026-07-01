import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'node:crypto';
import { REPLAY_SAFE_TIME } from 'src/common/constants';
import { TelegramUserData } from 'src/common/types/user';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService
{
	constructor(
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
		private readonly repository: AuthRepository,
	)
	{}

	/**
	 * Валидирует криптографическую подпись данных от Telegram Web App.
	 * * @description
	 * Алгоритм основан на официальной документации Telegram (HMAC-SHA-256).
	 * 1. Сортирует параметры по алфавиту.
	 * 2. Формирует строку проверки данных (Data-check-string).
	 * 3. Генерирует секретный ключ с использованием 'WebAppData' и токена бота.
	 * 4. Вычисляет хэш и безопасно сравнивает его (защита от Timing Attack).
	 * 5. Проверяет актуальность данных (не старше 5 минут) для защиты от Replay-атак.
	 * * @param {string} initData - Сырая строка `WebApp.initData`, полученная от клиента.
	 * @returns {TelegramUserData} - Распарсенный JSON с данными пользователя от Telegram.
	 * @throws {UnauthorizedException} - Если хэш отсутствует, не совпадает, данные устарели или JSON имеет неверный формат.
	 */
	private validateInitData(initData: string): TelegramUserData
	{
		const urlParams = new URLSearchParams(initData);
		const hash = urlParams.get('hash');

		if (!hash)
		{
			throw new UnauthorizedException('Отсутствует параметр hash в initData');
		}

		urlParams.delete('hash');
		urlParams.sort();

		let dataCheckString = '';
		for (const [key, value] of urlParams.entries())
		{
			dataCheckString += `${key}=${value}\n`;
		}
		dataCheckString = dataCheckString.slice(0, -1);

		const botToken = this.configService.getOrThrow<string>('BOT_TOKEN');

		const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

		// Генерируем ожидаемый хэш в виде Buffer для безопасного сравнения
		const expectedHashBuffer = crypto.createHmac('sha256', secretKey).update(dataCheckString)
			.digest();
		// Преобразуем присланный клиентом хэш (hex строка) в Buffer
		const receivedHashBuffer = Buffer.from(hash, 'hex');

		// Защита от Timing Attack (Атака по времени)
		// NOTE: Важно: сначала проверяем длину буферов, иначе timingSafeEqual выбросит ошибку
		if (
			expectedHashBuffer.length !== receivedHashBuffer.length
			|| !crypto.timingSafeEqual(expectedHashBuffer, receivedHashBuffer)
		)
		{
			throw new UnauthorizedException('Невалидный хэш. Данные подделаны.');
		}

		const authDate = Number.parseInt(urlParams.get('auth_date') || '0', 10);
		const currentTimestamp = Math.floor(Date.now() / 1000);

		if (currentTimestamp - authDate > REPLAY_SAFE_TIME)
		{
			throw new UnauthorizedException('Данные авторизации Telegram устарели');
		}

		const userString = urlParams.get('user');
		if (!userString)
		{
			throw new UnauthorizedException('В initData отсутствуют данные пользователя (user)');
		}

		try
		{
			return JSON.parse(userString) as TelegramUserData;
		}
		catch (error)
		{
			throw new UnauthorizedException('Неверный формат JSON в данных пользователя');
		}
	}

	/**
	 * Осуществляет вход или регистрацию пользователя через Telegram Web App.
	 * * @description
	 * 1. Безопасно проверяет строку `initData` через метод `validateInitData`.
	 * 2. Ищет пользователя в базе данных по `telegramId` или создает его.
	 * 3. Выпускает и возвращает JWT-токен для дальнейшей аутентификации запросов к API.
	 * * @param {string} initData - Сырая строка `WebApp.initData` от клиента.
	 * @returns {Promise<{ accessToken: string }>} - Объект, содержащий сгенерированный JWT-токен (Bearer).
	 */
	async telegramLogin(initData: string): Promise<{ accessToken: string }>
	{
		// Шаг 1: Криптографическая проверка
		const tgUser = this.validateInitData(initData);

		// Шаг 2: Поиск или создание пользователя
		const user = await this.repository.findOrCreateUser(tgUser.id);

		// Шаг 3: Генерация JWT
		const payload = {
			sub: String(user.id),
			telegramId: String(user.telegramId),
		};

		return {
			accessToken: this.jwtService.sign(payload),
		};
	}
}
