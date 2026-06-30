import { I18nFlavor } from '@grammyjs/i18n';
import { Context, SessionFlavor } from 'grammy';

export interface SessionData
{
	__language_code?: string;
}

export type CTX =
	& Context
	& SessionFlavor<SessionData>
	& I18nFlavor;
