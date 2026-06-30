import { Injectable } from '@nestjs/common';
import { Composer } from 'grammy';
import { CTX } from 'src/bot/context';
import { StartCommands } from './start.commands';

@Injectable()
export class StartComposer
{
	public readonly composer = new Composer<CTX>();

	constructor(
		private readonly commands: StartCommands,
	)
	{
		this.composer.command('start', async (ctx) =>
		{
			commands.start(ctx);
		});
	}
}
