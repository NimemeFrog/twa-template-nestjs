import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate
{
	constructor(private readonly jwtService: JwtService)
	{}

	async canActivate(context: ExecutionContext): Promise<boolean>
	{
		const request = context.switchToHttp().getRequest();
		const authHeader = request.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer '))
		{
			throw new UnauthorizedException('Token is missing');
		}

		const token = authHeader.split(' ')[1];
		try
		{
			const payload = await this.jwtService.verifyAsync(token);
			// Сохраняем payload данные юзера в request
			request['user'] = payload;
		}
		catch
		{
			throw new UnauthorizedException('Invalid token');
		}
		return true;
	}
}
