import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthenticateAthleteUseCase } from '../../../src/core/application/use-cases/authenticate-athlete.use-case';
import { GetAuthenticatedAthleteProfileUseCase } from '../../../src/core/application/use-cases/get-authenticated-athlete-profile.use-case';
import { RefreshAuthTokenUseCase } from '../../../src/core/application/use-cases/refresh-auth-token.use-case';
import { RegisterAthleteUseCase } from '../../../src/core/application/use-cases/register-athlete.use-case';
import {
  ATHLETE_REPOSITORY_PORT,
  AthleteRepositoryPort,
} from '../../../src/core/domain/ports/athlete-repository.port';
import {
  PASSWORD_HASHER_PORT,
  PasswordHasherPort,
} from '../../../src/core/domain/ports/password-hasher.port';
import {
  TOKEN_SERVICE_PORT,
  TokenServicePort,
} from '../../../src/core/domain/ports/token-service.port';
import { SecurityModule } from '../../../src/infrastructure/security/security.module';
import { AuthController } from '../../../src/presentation/controllers/auth.controller';
import { DomainExceptionFilter } from '../../../src/presentation/filters/domain-exception.filter';
import { JwtAuthGuard } from '../../../src/presentation/guards/jwt-auth.guard';
import { InMemoryAthleteRepository } from '../../unit/repositories/in-memory-athlete.repository';

describe('AuthController (HTTP Integration for Mobile Login)', () => {
  let app: INestApplication;
  let repository: InMemoryAthleteRepository;

  beforeEach(async () => {
    repository = new InMemoryAthleteRepository();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), SecurityModule],
      controllers: [AuthController],
      providers: [
        JwtAuthGuard,
        {
          provide: ATHLETE_REPOSITORY_PORT,
          useValue: repository,
        },
        {
          provide: RegisterAthleteUseCase,
          useFactory: (
            repo: AthleteRepositoryPort,
            hasher: PasswordHasherPort,
            tokens: TokenServicePort,
          ) => new RegisterAthleteUseCase(repo, hasher, tokens),
          inject: [
            ATHLETE_REPOSITORY_PORT,
            PASSWORD_HASHER_PORT,
            TOKEN_SERVICE_PORT,
          ],
        },
        {
          provide: AuthenticateAthleteUseCase,
          useFactory: (
            repo: AthleteRepositoryPort,
            hasher: PasswordHasherPort,
            tokens: TokenServicePort,
          ) => new AuthenticateAthleteUseCase(repo, hasher, tokens),
          inject: [
            ATHLETE_REPOSITORY_PORT,
            PASSWORD_HASHER_PORT,
            TOKEN_SERVICE_PORT,
          ],
        },
        {
          provide: RefreshAuthTokenUseCase,
          useFactory: (
            repo: AthleteRepositoryPort,
            tokens: TokenServicePort,
          ) => new RefreshAuthTokenUseCase(repo, tokens),
          inject: [ATHLETE_REPOSITORY_PORT, TOKEN_SERVICE_PORT],
        },
        {
          provide: GetAuthenticatedAthleteProfileUseCase,
          useFactory: (repo: AthleteRepositoryPort) =>
            new GetAuthenticatedAthleteProfileUseCase(repo),
          inject: [ATHLETE_REPOSITORY_PORT],
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('Fluxo Completo Mobile: POST /auth/register -> POST /auth/login -> GET /auth/me -> POST /auth/refresh', async () => {
    // 1. Registro
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Atleta Mobile App',
        email: 'app@kilofuel.com',
        password: 'MobilePassword2026',
      })
      .expect(201);

    expect(registerRes.body.accessToken).toBeDefined();
    expect(registerRes.body.refreshToken).toBeDefined();
    expect(registerRes.body.athlete.email).toBe('app@kilofuel.com');

    // 2. Tentativa de registro duplicado -> 409 Conflict
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Outro Nome',
        email: 'app@kilofuel.com',
        password: 'MobilePassword2026',
      })
      .expect(409);

    // 3. Login Mobile
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'app@kilofuel.com',
        password: 'MobilePassword2026',
      })
      .expect(200);

    const { accessToken, refreshToken } = loginRes.body;

    // 4. Rota protegida GET /auth/me com Bearer Token
    const meRes = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(meRes.body.email).toBe('app@kilofuel.com');
    expect(meRes.body.name).toBe('Atleta Mobile App');

    // 5. Renovação de token via POST /auth/refresh
    const refreshRes = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(refreshRes.body.accessToken).toBeDefined();

    // 6. Acesso sem token deve retornar 401 Unauthorized
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });
});

