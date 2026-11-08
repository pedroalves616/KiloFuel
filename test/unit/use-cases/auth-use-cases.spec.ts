import { ConfigService } from '@nestjs/config';
import { AuthenticateAthleteUseCase } from '../../../src/core/application/use-cases/authenticate-athlete.use-case';
import { GetAuthenticatedAthleteProfileUseCase } from '../../../src/core/application/use-cases/get-authenticated-athlete-profile.use-case';
import { RefreshAuthTokenUseCase } from '../../../src/core/application/use-cases/refresh-auth-token.use-case';
import { RegisterAthleteUseCase } from '../../../src/core/application/use-cases/register-athlete.use-case';
import { AthleteAlreadyExistsError } from '../../../src/core/domain/errors/athlete-already-exists.error';
import { InvalidAthleteError } from '../../../src/core/domain/errors/invalid-athlete.error';
import { InvalidCredentialsError } from '../../../src/core/domain/errors/invalid-credentials.error';
import { InvalidEmailError } from '../../../src/core/domain/errors/invalid-email.error';
import { JwtTokenService } from '../../../src/infrastructure/security/jwt-token.service';
import { ScryptPasswordHasher } from '../../../src/infrastructure/security/scrypt-password.hasher';
import { InMemoryAthleteRepository } from '../repositories/in-memory-athlete.repository';

describe('Auth & Athlete Use Cases (Mobile Authentication Unit Tests)', () => {
  let athleteRepository: InMemoryAthleteRepository;
  let passwordHasher: ScryptPasswordHasher;
  let tokenService: JwtTokenService;
  let registerAthleteUseCase: RegisterAthleteUseCase;
  let authenticateAthleteUseCase: AuthenticateAthleteUseCase;
  let refreshAuthTokenUseCase: RefreshAuthTokenUseCase;
  let getAuthenticatedAthleteProfileUseCase: GetAuthenticatedAthleteProfileUseCase;

  beforeEach(() => {
    athleteRepository = new InMemoryAthleteRepository();
    passwordHasher = new ScryptPasswordHasher();
    tokenService = new JwtTokenService(new ConfigService());

    registerAthleteUseCase = new RegisterAthleteUseCase(
      athleteRepository,
      passwordHasher,
      tokenService,
    );
    authenticateAthleteUseCase = new AuthenticateAthleteUseCase(
      athleteRepository,
      passwordHasher,
      tokenService,
    );
    refreshAuthTokenUseCase = new RefreshAuthTokenUseCase(
      athleteRepository,
      tokenService,
    );
    getAuthenticatedAthleteProfileUseCase =
      new GetAuthenticatedAthleteProfileUseCase(athleteRepository);
  });

  describe('RegisterAthleteUseCase', () => {
    it('deve registrar um novo atleta com e-mail normalizado, senha com hash scrypt e retornar tokens JWT', async () => {
      const result = await registerAthleteUseCase.execute({
        name: 'Pedro Alves',
        email: '  Pedro.Alves@KiloFuel.com ',
        password: 'StrongPassword123!',
      });

      expect(result.athlete.id).toBeDefined();
      expect(result.athlete.name).toBe('Pedro Alves');
      expect(result.athlete.email).toBe('pedro.alves@kilofuel.com');
      expect(result.tokenType).toBe('Bearer');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      const saved = await athleteRepository.findByEmail(
        'pedro.alves@kilofuel.com',
      );
      expect(saved).not.toBeNull();
      expect(saved?.passwordHash).not.toBe('StrongPassword123!');
      expect(saved?.passwordHash).toContain(':');
    });

    it('deve lançar AthleteAlreadyExistsError quando o e-mail já estiver em uso', async () => {
      await registerAthleteUseCase.execute({
        name: 'Atleta 1',
        email: 'duplicado@kilofuel.com',
        password: 'Password123!',
      });

      await expect(
        registerAthleteUseCase.execute({
          name: 'Atleta 2',
          email: 'DUPLICADO@kilofuel.com',
          password: 'Password456!',
        }),
      ).rejects.toThrow(AthleteAlreadyExistsError);
    });

    it('deve lançar InvalidEmailError ou InvalidAthleteError para entradas inválidas', async () => {
      await expect(
        registerAthleteUseCase.execute({
          name: 'Pedro',
          email: 'email-invalido',
          password: 'Password123!',
        }),
      ).rejects.toThrow(InvalidEmailError);

      await expect(
        registerAthleteUseCase.execute({
          name: 'Pedro',
          email: 'pedro@kilofuel.com',
          password: 'curta',
        }),
      ).rejects.toThrow(InvalidAthleteError);
    });
  });

  describe('AuthenticateAthleteUseCase (Login Mobile)', () => {
    it('deve autenticar um atleta com credenciais válidas e retornar accessToken e refreshToken', async () => {
      await registerAthleteUseCase.execute({
        name: 'Atleta Mobile',
        email: 'mobile@kilofuel.com',
        password: 'MobileSecretPassword99',
      });

      const loginOutput = await authenticateAthleteUseCase.execute({
        email: 'MOBILE@kilofuel.com',
        password: 'MobileSecretPassword99',
      });

      expect(loginOutput.accessToken).toBeDefined();
      expect(loginOutput.refreshToken).toBeDefined();
      expect(loginOutput.athlete.email).toBe('mobile@kilofuel.com');
    });

    it('deve lançar InvalidCredentialsError para senha incorreta ou usuário inexistente', async () => {
      await registerAthleteUseCase.execute({
        name: 'Atleta Mobile',
        email: 'mobile@kilofuel.com',
        password: 'MobileSecretPassword99',
      });

      await expect(
        authenticateAthleteUseCase.execute({
          email: 'mobile@kilofuel.com',
          password: 'WrongPassword123',
        }),
      ).rejects.toThrow(InvalidCredentialsError);

      await expect(
        authenticateAthleteUseCase.execute({
          email: 'naoexiste@kilofuel.com',
          password: 'MobileSecretPassword99',
        }),
      ).rejects.toThrow(InvalidCredentialsError);
    });
  });

  describe('RefreshAuthTokenUseCase & GetAuthenticatedAthleteProfileUseCase', () => {
    it('deve renovar o par de tokens usando um refreshToken válido e bloquear uso de accessToken no refresh', async () => {
      const registered = await registerAthleteUseCase.execute({
        name: 'Atleta Refresh',
        email: 'refresh@kilofuel.com',
        password: 'RefreshPassword123',
      });

      const refreshed = await refreshAuthTokenUseCase.execute({
        refreshToken: registered.refreshToken,
      });

      expect(refreshed.accessToken).toBeDefined();
      expect(refreshed.refreshToken).toBeDefined();
      expect(refreshed.athlete.id).toBe(registered.athlete.id);

      const profile = await getAuthenticatedAthleteProfileUseCase.execute(
        registered.athlete.id,
      );
      expect(profile.email).toBe('refresh@kilofuel.com');

      await expect(
        refreshAuthTokenUseCase.execute({
          refreshToken: registered.accessToken,
        }),
      ).rejects.toThrow(InvalidCredentialsError);
    });
  });
});

