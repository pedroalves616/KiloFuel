import { EntityNotFoundError } from '../../domain/errors/entity-not-found.error';
import { DietPlanRepositoryPort } from '../../domain/ports/diet-plan-repository.port';
import { MealItem } from '../../domain/value-objects/meal-item.vo';
import {
  CreateMealInputDto,
  DietPlanOutputDto,
  DietPlanOutputMapper,
} from '../dtos/calculate-diet-input.dto';

export class LogDailyMealConsumptionUseCase {
  constructor(private readonly dietPlanRepository: DietPlanRepositoryPort) {}

  public async execute(
    dietPlanId: string,
    mealInput: CreateMealInputDto,
  ): Promise<DietPlanOutputDto> {
    const dietPlan = await this.dietPlanRepository.findById(dietPlanId);
    if (!dietPlan) {
      throw new EntityNotFoundError('DietPlan', dietPlanId);
    }

    const meal = MealItem.create({
      name: mealInput.name,
      time: mealInput.time,
      proteinsGrams: mealInput.proteinsGrams,
      carbsGrams: mealInput.carbsGrams,
      fatsGrams: mealInput.fatsGrams,
    });

    dietPlan.addMeal(meal);
    await this.dietPlanRepository.save(dietPlan);

    return DietPlanOutputMapper.toOutput(dietPlan);
  }
}

