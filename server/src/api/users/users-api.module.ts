import { Module } from '@nestjs/common';
import { UsersApiController } from './users-api.controller';

@Module({
	controllers: [UsersApiController],
})
export class UsersApiModule
{}
