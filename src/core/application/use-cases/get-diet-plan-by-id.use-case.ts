import { EntityNotFoundError } from '../../domain/errors/entity-not-found.error';
import { DietPlanRepositoryPort } from '../../domain/ports/diet-plan-repository.port';
import {
  DietPlanOutputDto,
  DietPlanOutputMapper,
} from '../dtos/calculate-diet-input.dto';

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

