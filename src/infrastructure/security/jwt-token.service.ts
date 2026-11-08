import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { InvalidCredentialsError } from '../../core/domain/errors/invalid-credentials.error';
import {
  AuthTokens,
  TokenPayload,
  TokenServicePort,
} from '../../core/domain/ports/token-service.port';

interface JwtClaims extends TokenPayload {
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
  iss: string;
}

@Injectable()
export class JwtTokenService implements TokenServicePort {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresInSeconds: number;
  private readonly refreshExpiresInSeconds: number;
  private readonly issuer = 'kilofuel-api';

  constructor(private readonly configService: ConfigService) {
    this.accessSecret = this.configService.get<string>(
      'JWT_SECRET',
      'kilofuel-dev-access-secret-change-in-prod-2026',
    );
    this.refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'kilofuel-dev-refresh-secret-change-in-prod-2026',
    );
    this.accessExpiresInSeconds = Number(
      this.configService.get<number>('JWT_EXPIRES_IN_SECONDS', 3600),
    );
    this.refreshExpiresInSeconds = Number(
      this.configService.get<number>('JWT_REFRESH_EXPIRES_IN_SECONDS', 604800),
    );
  }

  public async generateAuthTokens(payload: TokenPayload): Promise<AuthTokens> {
    const nowSeconds = Math.floor(Date.now() / 1000);

    const accessToken = this.signJwt(
      {
        sub: payload.sub,
        email: payload.email,
        type: 'access',
        iat: nowSeconds,
        exp: nowSeconds + this.accessExpiresInSeconds,
        iss: this.issuer,
      },
      this.accessSecret,
    );

    const refreshToken = this.signJwt(
      {
        sub: payload.sub,
        email: payload.email,
        type: 'refresh',
        iat: nowSeconds,
        exp: nowSeconds + this.refreshExpiresInSeconds,
        iss: this.issuer,
      },
      this.refreshSecret,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessExpiresInSeconds,
    };
  }

  public async verifyAccessToken(token: string): Promise<TokenPayload> {
    const claims = this.verifyJwt(token, this.accessSecret);
    if (claims.type !== 'access') {
      throw new InvalidCredentialsError('Tipo de token inválido para acesso.');
    }
    return {
      sub: claims.sub,
      email: claims.email,
    };
  }

  public async verifyRefreshToken(token: string): Promise<TokenPayload> {
    const claims = this.verifyJwt(token, this.refreshSecret);
    if (claims.type !== 'refresh') {
      throw new InvalidCredentialsError(
        'Tipo de token inválido para renovação de sessão.',
      );
    }
    return {
      sub: claims.sub,
      email: claims.email,
    };
  }

  private signJwt(claims: JwtClaims, secret: string): string {
    const headerEncoded = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    ).toString('base64url');
    const payloadEncoded = Buffer.from(JSON.stringify(claims)).toString(
      'base64url',
    );
    const signingInput = `${headerEncoded}.${payloadEncoded}`;
    const signature = createHmac('sha256', secret)
      .update(signingInput)
      .digest('base64url');

    return `${signingInput}.${signature}`;
  }

  private verifyJwt(token: string, secret: string): JwtClaims {
    if (!token || typeof token !== 'string') {
      throw new InvalidCredentialsError('Token ausente ou malformado.');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new InvalidCredentialsError('Formato de token JWT inválido.');
    }

    const [headerEncoded, payloadEncoded, signatureProvided] = parts;
    const signingInput = `${headerEncoded}.${payloadEncoded}`;
    const expectedSignature = createHmac('sha256', secret)
      .update(signingInput)
      .digest('base64url');

    const providedBuffer = Buffer.from(signatureProvided);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      providedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      throw new InvalidCredentialsError('Assinatura do token inválida.');
    }

    let claims: JwtClaims;
    try {
      const decodedJson = Buffer.from(payloadEncoded, 'base64url').toString(
        'utf8',
      );
      claims = JSON.parse(decodedJson) as JwtClaims;
    } catch {
      throw new InvalidCredentialsError('Payload do token inválido.');
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (
      typeof claims.exp !== 'number' ||
      claims.exp <= nowSeconds ||
      !claims.sub ||
      !claims.email
    ) {
      throw new InvalidCredentialsError('Token expirado ou inválido.');
    }

    return claims;
  }
}
