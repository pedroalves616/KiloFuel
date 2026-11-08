import { DietPlan } from '../../../../core/domain/entities/diet-plan.entity';
import { MacroNutrients } from '../../../../core/domain/value-objects/macro-nutrients.vo';
import { MealItem } from '../../../../core/domain/value-objects/meal-item.vo';
import {
  DietPlanModel,
  DietPlanPersistenceAttributes,
} from '../models/diet-plan.model';

export interface DietPlanModelLike {
  get(options?: { plain: boolean }): DietPlanPersistenceAttributes;
}

export class DietPlanMapper {
  public static toDomain(model: DietPlanModel | DietPlanModelLike): DietPlan {
    const rawData = model.get({ plain: true });

    const targetMacros = MacroNutrients.create({
      proteinsGrams: Number(rawData.targetProteinsGrams),
      carbsGrams: Number(rawData.targetCarbsGrams),
      fatsGrams: Number(rawData.targetFatsGrams),
    });

    const meals = (rawData.meals ?? []).map((mealData) =>
      MealItem.create({
        id: mealData.id,
        name: mealData.name,
        time: mealData.time,
        proteinsGrams: Number(mealData.proteinsGrams),
        carbsGrams: Number(mealData.carbsGrams),
        fatsGrams: Number(mealData.fatsGrams),
        loggedAt: mealData.loggedAt,
      }),
    );

    return DietPlan.reconstitute({
      id: rawData.id,
      athleteId: rawData.athleteId,
      name: rawData.name,
      goal: rawData.goal,
      targetMacros,
      meals,
      isActive: rawData.isActive,
      createdAt: new Date(rawData.createdAt),
      updatedAt: new Date(rawData.updatedAt),
    });
  }

  public static toPersistence(entity: DietPlan): DietPlanPersistenceAttributes {
    return {
      id: entity.id,
      athleteId: entity.athleteId,
      name: entity.name,
      goal: entity.goal,
      targetProteinsGrams: entity.targetMacros.proteinsGrams,
      targetCarbsGrams: entity.targetMacros.carbsGrams,
      targetFatsGrams: entity.targetMacros.fatsGrams,
      meals: entity.meals.map((meal) => meal.toPrimitives()),
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

