import { Module } from '@nestjs/common';
import { AuthenticateAthleteUseCase } from '../core/application/use-cases/authenticate-athlete.use-case';
import { GetAuthenticatedAthleteProfileUseCase } from '../core/application/use-cases/get-authenticated-athlete-profile.use-case';
import { RefreshAuthTokenUseCase } from '../core/application/use-cases/refresh-auth-token.use-case';
import { RegisterAthleteUseCase } from '../core/application/use-cases/register-athlete.use-case';
import {
  ATHLETE_REPOSITORY_PORT,
  AthleteRepositoryPort,
} from '../core/domain/ports/athlete-repository.port';
import {
  PASSWORD_HASHER_PORT,
  PasswordHasherPort,
} from '../core/domain/ports/password-hasher.port';
import {
  TOKEN_SERVICE_PORT,
  TokenServicePort,
} from '../core/domain/ports/token-service.port';
import { PersistenceModule } from '../infrastructure/persistence/sequelize/persistence.module';
import { SecurityModule } from '../infrastructure/security/security.module';
import { AuthController } from './controllers/auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [PersistenceModule, SecurityModule],
  controllers: [AuthController],
  providers: [
    JwtAuthGuard,
    {
      provide: RegisterAthleteUseCase,
      useFactory: (
        athleteRepository: AthleteRepositoryPort,
        passwordHasher: PasswordHasherPort,
        tokenService: TokenServicePort,
      ) =>
        new RegisterAthleteUseCase(
          athleteRepository,
          passwordHasher,
          tokenService,
        ),
      inject: [
        ATHLETE_REPOSITORY_PORT,
        PASSWORD_HASHER_PORT,
        TOKEN_SERVICE_PORT,
      ],
    },
    {
      provide: AuthenticateAthleteUseCase,
      useFactory: (
        athleteRepository: AthleteRepositoryPort,
        passwordHasher: PasswordHasherPort,
        tokenService: TokenServicePort,
      ) =>
        new AuthenticateAthleteUseCase(
          athleteRepository,
          passwordHasher,
          tokenService,
        ),
      inject: [
        ATHLETE_REPOSITORY_PORT,
        PASSWORD_HASHER_PORT,
        TOKEN_SERVICE_PORT,
      ],
    },
    {
      provide: RefreshAuthTokenUseCase,
      useFactory: (
        athleteRepository: AthleteRepositoryPort,
        tokenService: TokenServicePort,
      ) => new RefreshAuthTokenUseCase(athleteRepository, tokenService),
      inject: [ATHLETE_REPOSITORY_PORT, TOKEN_SERVICE_PORT],
    },
    {
      provide: GetAuthenticatedAthleteProfileUseCase,
      useFactory: (athleteRepository: AthleteRepositoryPort) =>
        new GetAuthenticatedAthleteProfileUseCase(athleteRepository),
      inject: [ATHLETE_REPOSITORY_PORT],
    },
  ],
  exports: [
    JwtAuthGuard,
    RegisterAthleteUseCase,
    AuthenticateAthleteUseCase,
    RefreshAuthTokenUseCase,
    GetAuthenticatedAthleteProfileUseCase,
  ],
})
export class AuthModule {}

