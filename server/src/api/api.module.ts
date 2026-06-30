import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { AuthModule } from './auth/auth.module';
import { UsersApiModule } from './users/users-api.module';

@Module({
	imports: [AuthModule, UsersApiModule],
	controllers: [ApiController],
})
export class ApiModule
{}
