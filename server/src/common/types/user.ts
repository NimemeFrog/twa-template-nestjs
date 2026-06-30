/**
 * Интерфейс, описывающий структуру данных пользователя,
 * приходящую от Telegram.
 */
export interface TelegramUserData
{
	id: number;
	first_name: string;
	last_name?: string;
	username?: string;
	language_code?: string;
	allows_write_to_pm?: boolean;
}
