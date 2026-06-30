import { I18n } from '@grammyjs/i18n';
import { Injectable } from '@nestjs/common';
import * as path from 'node:path';

@Injectable()
export class I18nService
{
	private readonly i18n: I18n;

	constructor()
	{
		const localesDirectory = path.join(__dirname, 'common', 'locales');

		this.i18n = new I18n({
			defaultLocale: 'ru',
			directory: localesDirectory,
			useSession: false,
		});
	}

	/**
	 * Возвращает настроенный инстанс I18n в качестве middleware для grammY.
	 */
	public getMiddleware()
	{
		return this.i18n;
	}
}
