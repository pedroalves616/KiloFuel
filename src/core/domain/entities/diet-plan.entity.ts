import { InvalidDietPlanError } from '../errors/invalid-diet-plan.error';
import { MacroNutrients } from '../value-objects/macro-nutrients.vo';
import { MealItem } from '../value-objects/meal-item.vo';

export type DietGoal = 'BULKING' | 'CUTTING' | 'MAINTENANCE' | 'RECOMPOSITION';

export interface CreateDietPlanProps {
  id?: string;
  athleteId: string;
  name: string;
  goal: DietGoal;
  targetMacros: MacroNutrients;
  meals?: MealItem[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReconstituteDietPlanProps {
  id: string;
  athleteId: string;
  name: string;
  goal: DietGoal;
  targetMacros: MacroNutrients;
  meals: MealItem[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class DietPlan {
  private readonly _id: string;
  private readonly _athleteId: string;
  private _name: string;
  private _goal: DietGoal;
  private _targetMacros: MacroNutrients;
  private _meals: MealItem[];
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ReconstituteDietPlanProps) {
    this._id = props.id;
    this._athleteId = props.athleteId;
    this._name = props.name;
    this._goal = props.goal;
    this._targetMacros = props.targetMacros;
    this._meals = [...props.meals];
    this._isActive = props.isActive;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(props: CreateDietPlanProps): DietPlan {
    const now = new Date();
    const id = props.id?.trim() || crypto.randomUUID();

    DietPlan.validateInvariants({
      athleteId: props.athleteId,
      name: props.name,
      targetMacros: props.targetMacros,
    });

    return new DietPlan({
      id,
      athleteId: props.athleteId.trim(),
      name: props.name.trim(),
      goal: props.goal,
      targetMacros: props.targetMacros,
      meals: props.meals ? [...props.meals] : [],
      isActive: props.isActive ?? true,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  public static reconstitute(props: ReconstituteDietPlanProps): DietPlan {
    if (!props.id || props.id.trim().length === 0) {
      throw new InvalidDietPlanError(
        'O ID do plano alimentar é obrigatório na reconstituição.',
      );
    }

    DietPlan.validateInvariants({
      athleteId: props.athleteId,
      name: props.name,
      targetMacros: props.targetMacros,
    });

    return new DietPlan(props);
  }

  private static validateInvariants(params: {
    athleteId: string;
    name: string;
    targetMacros: MacroNutrients;
  }): void {
    if (!params.athleteId || params.athleteId.trim().length === 0) {
      throw new InvalidDietPlanError(
        'O identificador do atleta (athleteId) é obrigatório.',
      );
    }

    if (!params.name || params.name.trim().length < 3) {
      throw new InvalidDietPlanError(
        'O nome do plano alimentar deve possuir pelo menos 3 caracteres.',
      );
    }

    if (!params.targetMacros || params.targetMacros.calories < 800) {
      throw new InvalidDietPlanError(
        'A meta calórica diária do plano deve ser de no mínimo 800 kcal.',
      );
    }
  }

  public addMeal(meal: MealItem): DietPlan {
    this._meals.push(meal);
    this.touch();
    return this;
  }

  public deactivate(): DietPlan {
    this._isActive = false;
    this.touch();
    return this;
  }

  public get consumedMacros(): MacroNutrients {
    let total = MacroNutrients.create({
      proteinsGrams: 0,
      carbsGrams: 0,
      fatsGrams: 0,
      allowZeroTotal: true,
    });

    for (const meal of this._meals) {
      total = total.add(meal.macros);
    }

    return total;
  }

  public get targetCalories(): number {
    return this._targetMacros.calories;
  }

  public get consumedCalories(): number {
    return this.consumedMacros.calories;
  }

  public get remainingCalories(): number {
    return Math.max(0, this.targetCalories - this.consumedCalories);
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  public get id(): string {
    return this._id;
  }

  public get athleteId(): string {
    return this._athleteId;
  }

  public get name(): string {
    return this._name;
  }

  public get goal(): DietGoal {
    return this._goal;
  }

  public get targetMacros(): MacroNutrients {
    return this._targetMacros;
  }

  public get meals(): ReadonlyArray<MealItem> {
    return [...this._meals];
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}

