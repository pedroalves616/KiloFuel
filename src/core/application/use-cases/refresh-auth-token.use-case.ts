import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import { AthleteRepositoryPort } from '../../domain/ports/athlete-repository.port';
import { TokenServicePort } from '../../domain/ports/token-service.port';
import {
  AthleteOutputMapper,
  AuthOutputDto,
  RefreshTokenInputDto,
} from '../dtos/auth.dto';

export class RefreshAuthTokenUseCase {
  constructor(
    private readonly athleteRepository: AthleteRepositoryPort,
    private readonly tokenService: TokenServicePort,
  ) {}

  public async execute(input: RefreshTokenInputDto): Promise<AuthOutputDto> {
    if (!input.refreshToken || input.refreshToken.trim().length === 0) {
      throw new InvalidCredentialsError('Refresh token é obrigatório.');
    }

    const payload = await this.tokenService.verifyRefreshToken(
      input.refreshToken,
    );

    const athlete = await this.athleteRepository.findById(payload.sub);
    if (!athlete || !athlete.isActive) {
      throw new InvalidCredentialsError(
        'Conta de atleta não encontrada ou inativa.',
      );
    }

    const tokens = await this.tokenService.generateAuthTokens({
      sub: athlete.id,
      email: athlete.email.value,
    });

    return AthleteOutputMapper.toAuthOutput(athlete, tokens);
  }
}

