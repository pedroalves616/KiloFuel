import { EntityNotFoundError } from '../../domain/errors/entity-not-found.error';
import { DietPlanRepositoryPort } from '../../domain/ports/diet-plan-repository.port';
import {
  DietPlanOutputDto,
  DietPlanOutputMapper,
} from '../dtos/calculate-diet-input.dto';

export class ListDietsByAthleteUseCase {
  constructor(private readonly dietPlanRepository: DietPlanRepositoryPort) {}

  public async execute(params: {
    athleteId: string;
    onlyActive?: boolean;
  }): Promise<DietPlanOutputDto[]> {
    const plans = await this.dietPlanRepository.findByAthleteId(
      params.athleteId,
    );
    const filtered = params.onlyActive
      ? plans.filter((plan) => plan.isActive)
      : plans;
    return filtered.map((plan) => DietPlanOutputMapper.toOutput(plan));
  }
}

export class GetDietPlanByIdUseCase {
  constructor(private readonly dietPlanRepository: DietPlanRepositoryPort) {}

  public async execute(id: string): Promise<DietPlanOutputDto> {
    const plan = await this.dietPlanRepository.findById(id);
    if (!plan) {
      throw new EntityNotFoundError('DietPlan', id);
    }
    return DietPlanOutputMapper.toOutput(plan);
  }
}

