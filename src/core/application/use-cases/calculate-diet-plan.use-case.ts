import { DietPlan } from '../../domain/entities/diet-plan.entity';
import { DietPlanRepositoryPort } from '../../domain/ports/diet-plan-repository.port';
import { MacroNutrients } from '../../domain/value-objects/macro-nutrients.vo';
import { MealItem } from '../../domain/value-objects/meal-item.vo';
import {
  CalculateDietInputDto,
  DietPlanOutputDto,
  DietPlanOutputMapper,
} from '../dtos/calculate-diet-input.dto';

export class CalculateDietPlanUseCase {
  constructor(private readonly dietPlanRepository: DietPlanRepositoryPort) {}

  public async execute(
    input: CalculateDietInputDto,
  ): Promise<DietPlanOutputDto> {
    const targetMacros = MacroNutrients.create({
      proteinsGrams: input.targetProteinsGrams,
      carbsGrams: input.targetCarbsGrams,
      fatsGrams: input.targetFatsGrams,
    });

    const meals = (input.meals ?? []).map((meal) =>
      MealItem.create({
        name: meal.name,
        time: meal.time,
        proteinsGrams: meal.proteinsGrams,
        carbsGrams: meal.carbsGrams,
        fatsGrams: meal.fatsGrams,
      }),
    );

    const dietPlan = DietPlan.create({
      athleteId: input.athleteId,
      name: input.name,
      goal: input.goal,
      targetMacros,
      meals,
      isActive: true,
    });

    const shouldDeactivate = input.deactivateExistingPlans ?? true;
    if (shouldDeactivate) {
      const currentActive = await this.dietPlanRepository.findActiveByAthleteId(
        dietPlan.athleteId,
      );
      if (currentActive) {
        currentActive.deactivate();
        await this.dietPlanRepository.save(currentActive);
      }
    }

    await this.dietPlanRepository.save(dietPlan);

    return DietPlanOutputMapper.toOutput(dietPlan);
  }
}

