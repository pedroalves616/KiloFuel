export const TOKEN_SERVICE_PORT = Symbol('TOKEN_SERVICE_PORT');

export interface TokenPayload {
  sub: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenServicePort {
  generateAuthTokens(payload: TokenPayload): Promise<AuthTokens>;
  verifyAccessToken(token: string): Promise<TokenPayload>;
  verifyRefreshToken(token: string): Promise<TokenPayload>;
}

