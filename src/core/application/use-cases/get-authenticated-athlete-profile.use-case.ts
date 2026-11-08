import { EntityNotFoundError } from '../../domain/errors/entity-not-found.error';
import { AthleteRepositoryPort } from '../../domain/ports/athlete-repository.port';
import {
  AthleteOutputMapper,
  AthleteProfileOutputDto,
} from '../dtos/auth.dto';

export class GetAuthenticatedAthleteProfileUseCase {
  constructor(private readonly athleteRepository: AthleteRepositoryPort) {}

  public async execute(athleteId: string): Promise<AthleteProfileOutputDto> {
    const athlete = await this.athleteRepository.findById(athleteId);

    if (!athlete) {
      throw new EntityNotFoundError('Athlete', athleteId);
    }

    return AthleteOutputMapper.toProfileOutput(athlete);
  }
}

