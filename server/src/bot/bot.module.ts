import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { StartModule } from './commands/start/start.module';
import { I18nService } from './i18n.service';

@Module({
	imports: [StartModule],
	providers: [BotService, I18nService],
	exports: [I18nService],
})
export class BotModule
{}
