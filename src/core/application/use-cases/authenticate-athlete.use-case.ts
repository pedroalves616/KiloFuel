import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import { AthleteRepositoryPort } from '../../domain/ports/athlete-repository.port';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { TokenServicePort } from '../../domain/ports/token-service.port';
import { Email } from '../../domain/value-objects/email.vo';
import {
  AthleteOutputMapper,
  AuthOutputDto,
  LoginInputDto,
} from '../dtos/auth.dto';

export class AuthenticateAthleteUseCase {
  constructor(
    private readonly athleteRepository: AthleteRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenService: TokenServicePort,
  ) {}

  public async execute(input: LoginInputDto): Promise<AuthOutputDto> {
    if (!input.email || !input.password) {
      throw new InvalidCredentialsError('E-mail e senha são obrigatórios.');
    }

    let emailVo: Email;
    try {
      emailVo = Email.create(input.email);
    } catch {
      throw new InvalidCredentialsError('E-mail ou senha inválidos.');
    }

    const athlete = await this.athleteRepository.findByEmail(emailVo.value);
    if (!athlete || !athlete.isActive) {
      throw new InvalidCredentialsError('E-mail ou senha inválidos.');
    }

    const isPasswordValid = await this.passwordHasher.compare(
      input.password,
      athlete.passwordHash,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError('E-mail ou senha inválidos.');
    }

    const tokens = await this.tokenService.generateAuthTokens({
      sub: athlete.id,
      email: athlete.email.value,
    });

    return AthleteOutputMapper.toAuthOutput(athlete, tokens);
  }
}

