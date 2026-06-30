import { Module } from '@nestjs/common';
import { StartCommands } from './start.commands';
import { StartComposer } from './start.composer';

@Module({
	providers: [StartComposer, StartCommands],
	exports: [StartComposer],
})
export class StartModule
{}
