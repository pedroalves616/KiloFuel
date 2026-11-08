import { Athlete } from '../../domain/entities/athlete.entity';
import { AthleteAlreadyExistsError } from '../../domain/errors/athlete-already-exists.error';
import { InvalidAthleteError } from '../../domain/errors/invalid-athlete.error';
import { AthleteRepositoryPort } from '../../domain/ports/athlete-repository.port';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { TokenServicePort } from '../../domain/ports/token-service.port';
import { Email } from '../../domain/value-objects/email.vo';
import {
  AthleteOutputMapper,
  AuthOutputDto,
  RegisterAthleteInputDto,
} from '../dtos/auth.dto';

export class RegisterAthleteUseCase {
  private static readonly MIN_PASSWORD_LENGTH = 8;

  constructor(
    private readonly athleteRepository: AthleteRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenService: TokenServicePort,
  ) {}

  public async execute(input: RegisterAthleteInputDto): Promise<AuthOutputDto> {
    if (
      !input.password ||
      input.password.length < RegisterAthleteUseCase.MIN_PASSWORD_LENGTH
    ) {
      throw new InvalidAthleteError(
        `A senha deve possuir no mínimo ${RegisterAthleteUseCase.MIN_PASSWORD_LENGTH} caracteres.`,
      );
    }

    const emailVo = Email.create(input.email);

    const existingAthlete = await this.athleteRepository.findByEmail(
      emailVo.value,
    );
    if (existingAthlete) {
      throw new AthleteAlreadyExistsError(emailVo.value);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const athlete = Athlete.create({
      name: input.name,
      email: emailVo,
      passwordHash,
      isActive: true,
    });

    await this.athleteRepository.save(athlete);

    const tokens = await this.tokenService.generateAuthTokens({
      sub: athlete.id,
      email: athlete.email.value,
    });

    return AthleteOutputMapper.toAuthOutput(athlete, tokens);
  }
}

