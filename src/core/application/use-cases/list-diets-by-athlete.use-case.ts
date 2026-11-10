import { DietPlanRepositoryPort } from '../../domain/ports/diet-plan-repository.port';
import {
  DietPlanOutputDto,
  DietPlanOutputMapper,
} from '../dtos/calculate-diet-input.dto';

export interface ListDietsByAthleteQuery {
  athleteId: string;
  onlyActive?: boolean;
}

export class ListDietsByAthleteUseCase {
  constructor(private readonly dietPlanRepository: DietPlanRepositoryPort) {}

  public async execute(
    params: ListDietsByAthleteQuery,
  ): Promise<DietPlanOutputDto[]> {
    if (params.onlyActive) {
      const activePlan = await this.dietPlanRepository.findActiveByAthleteId(
        params.athleteId,
      );
      return activePlan ? [DietPlanOutputMapper.toOutput(activePlan)] : [];
    }

    const plans = await this.dietPlanRepository.findByAthleteId(
      params.athleteId,
    );
    return plans.map((plan) => DietPlanOutputMapper.toOutput(plan));
  }
}
