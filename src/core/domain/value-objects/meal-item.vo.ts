import { InvalidDietPlanError } from '../errors/invalid-diet-plan.error';
import { MacroNutrients } from './macro-nutrients.vo';

export interface MealItemPrimitives {
  id: string;
  name: string;
  time: string;
  proteinsGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  calories: number;
  loggedAt: string;
}

export class MealItem {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _time: string;
  private readonly _macros: MacroNutrients;
  private readonly _loggedAt: string;

  private constructor(props: {
    id: string;
    name: string;
    time: string;
    macros: MacroNutrients;
    loggedAt: string;
  }) {
    this._id = props.id;
    this._name = props.name;
    this._time = props.time;
    this._macros = props.macros;
    this._loggedAt = props.loggedAt;
    Object.freeze(this);
  }

  public static create(params: {
    id?: string;
    name: string;
    time: string;
    proteinsGrams: number;
    carbsGrams: number;
    fatsGrams: number;
    loggedAt?: string;
  }): MealItem {
    if (!params.name || params.name.trim().length < 2) {
      throw new InvalidDietPlanError(
        'O nome da refeição deve possuir pelo menos 2 caracteres.',
      );
    }

    if (!params.time || params.time.trim().length < 3) {
      throw new InvalidDietPlanError('O horário da refeição é obrigatório.');
    }

    const macros = MacroNutrients.create({
      proteinsGrams: params.proteinsGrams,
      carbsGrams: params.carbsGrams,
      fatsGrams: params.fatsGrams,
    });

    return new MealItem({
      id: params.id?.trim() || crypto.randomUUID(),
      name: params.name.trim(),
      time: params.time.trim(),
      macros,
      loggedAt: params.loggedAt || new Date().toISOString(),
    });
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get time(): string {
    return this._time;
  }

  public get macros(): MacroNutrients {
    return this._macros;
  }

  public get calories(): number {
    return this._macros.calories;
  }

  public get loggedAt(): string {
    return this._loggedAt;
  }

  public toPrimitives(): MealItemPrimitives {
    return {
      id: this._id,
      name: this._name,
      time: this._time,
      proteinsGrams: this._macros.proteinsGrams,
      carbsGrams: this._macros.carbsGrams,
      fatsGrams: this._macros.fatsGrams,
      calories: this._macros.calories,
      loggedAt: this._loggedAt,
    };
  }
}

