import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { InvalidCredentialsError } from '../../core/domain/errors/invalid-credentials.error';
import {
  TOKEN_SERVICE_PORT,
  TokenPayload,
  TokenServicePort,
} from '../../core/domain/ports/token-service.port';

export interface AuthenticatedRequest extends Request {
  athlete?: TokenPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_SERVICE_PORT)
    private readonly tokenService: TokenServicePort,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new InvalidCredentialsError(
        'Token de autenticação Bearer não fornecido.',
      );
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      throw new InvalidCredentialsError('Token de autenticação vazio.');
    }

    const payload = await this.tokenService.verifyAccessToken(token);
    request.athlete = payload;

    return true;
  }
}

