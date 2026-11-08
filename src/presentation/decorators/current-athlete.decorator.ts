import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { InvalidCredentialsError } from '../../core/domain/errors/invalid-credentials.error';
import { TokenPayload } from '../../core/domain/ports/token-service.port';
import { AuthenticatedRequest } from '../guards/jwt-auth.guard';

export const CurrentAthlete = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TokenPayload => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.athlete) {
      throw new InvalidCredentialsError('Atleta não autenticado na requisição.');
    }
    return request.athlete;
  },
);

