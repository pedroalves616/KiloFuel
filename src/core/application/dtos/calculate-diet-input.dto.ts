import { DietGoal, DietPlan } from '../../domain/entities/diet-plan.entity';
import { MacroNutrientsPrimitives } from '../../domain/value-objects/macro-nutrients.vo';
import { MealItemPrimitives } from '../../domain/value-objects/meal-item.vo';

export interface CreateMealInputDto {
  name: string;
  time: string;
  proteinsGrams: number;
  carbsGrams: number;
  fatsGrams: number;
}

export interface CalculateDietInputDto {
  athleteId: string;
  name: string;
  goal: DietGoal;
  targetProteinsGrams: number;
  targetCarbsGrams: number;
  targetFatsGrams: number;
  meals?: CreateMealInputDto[];
  deactivateExistingPlans?: boolean;
}

export interface DietPlanOutputDto {
  id: string;
  athleteId: string;
  name: string;
  goal: DietGoal;
  targetCalories: number;
  targetMacros: MacroNutrientsPrimitives;
  consumedCalories: number;
  consumedMacros: MacroNutrientsPrimitives;
  remainingCalories: number;
  meals: MealItemPrimitives[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class DietPlanOutputMapper {
  public static toOutput(dietPlan: DietPlan): DietPlanOutputDto {
    return {
      id: dietPlan.id,
      athleteId: dietPlan.athleteId,
      name: dietPlan.name,
      goal: dietPlan.goal,
      targetCalories: dietPlan.targetCalories,
      targetMacros: dietPlan.targetMacros.toPrimitives(),
      consumedCalories: dietPlan.consumedCalories,
      consumedMacros: dietPlan.consumedMacros.toPrimitives(),
      remainingCalories: dietPlan.remainingCalories,
      meals: dietPlan.meals.map((meal) => meal.toPrimitives()),
      isActive: dietPlan.isActive,
      createdAt: dietPlan.createdAt,
      updatedAt: dietPlan.updatedAt,
    };
  }
}

