import { Athlete } from '../../domain/entities/athlete.entity';
import { AuthTokens } from '../../domain/ports/token-service.port';

export interface RegisterAthleteInputDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginInputDto {
  email: string;
  password: string;
}

export interface RefreshTokenInputDto {
  refreshToken: string;
}

export interface AthleteProfileOutputDto {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthOutputDto {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  athlete: AthleteProfileOutputDto;
}

export class AthleteOutputMapper {
  public static toProfileOutput(athlete: Athlete): AthleteProfileOutputDto {
    return {
      id: athlete.id,
      name: athlete.name,
      email: athlete.email.value,
      isActive: athlete.isActive,
      createdAt: athlete.createdAt,
      updatedAt: athlete.updatedAt,
    };
  }

  public static toAuthOutput(
    athlete: Athlete,
    tokens: AuthTokens,
  ): AuthOutputDto {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: tokens.expiresIn,
      athlete: AthleteOutputMapper.toProfileOutput(athlete),
    };
  }
}

