import { InvalidMacroDistributionError } from '../errors/invalid-macro-distribution.error';

export interface MacroNutrientsPrimitives {
  proteinsGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  calories: number;
}

export class MacroNutrients {
  private readonly _proteinsGrams: number;
  private readonly _carbsGrams: number;
  private readonly _fatsGrams: number;
  private readonly _calories: number;

  private constructor(
    proteinsGrams: number,
    carbsGrams: number,
    fatsGrams: number,
  ) {
    this._proteinsGrams = Number(proteinsGrams.toFixed(2));
    this._carbsGrams = Number(carbsGrams.toFixed(2));
    this._fatsGrams = Number(fatsGrams.toFixed(2));
    this._calories = Math.round(
      this._proteinsGrams * 4 + this._carbsGrams * 4 + this._fatsGrams * 9,
    );
    Object.freeze(this);
  }

  public static create(params: {
    proteinsGrams: number;
    carbsGrams: number;
    fatsGrams: number;
    allowZeroTotal?: boolean;
  }): MacroNutrients {
    const { proteinsGrams, carbsGrams, fatsGrams, allowZeroTotal } = params;

    if (
      typeof proteinsGrams !== 'number' ||
      Number.isNaN(proteinsGrams) ||
      proteinsGrams < 0 ||
      typeof carbsGrams !== 'number' ||
      Number.isNaN(carbsGrams) ||
      carbsGrams < 0 ||
      typeof fatsGrams !== 'number' ||
      Number.isNaN(fatsGrams) ||
      fatsGrams < 0
    ) {
      throw new InvalidMacroDistributionError(
        'As quantidades de proteínas, carboidratos e gorduras não podem ser negativas.',
      );
    }

    const total = proteinsGrams + carbsGrams + fatsGrams;
    if (!allowZeroTotal && total <= 0) {
      throw new InvalidMacroDistributionError(
        'A soma dos macronutrientes deve ser maior que zero.',
      );
    }

    return new MacroNutrients(proteinsGrams, carbsGrams, fatsGrams);
  }

  public get proteinsGrams(): number {
    return this._proteinsGrams;
  }

  public get carbsGrams(): number {
    return this._carbsGrams;
  }

  public get fatsGrams(): number {
    return this._fatsGrams;
  }

  public get calories(): number {
    return this._calories;
  }

  public add(other: MacroNutrients): MacroNutrients {
    return MacroNutrients.create({
      proteinsGrams: this._proteinsGrams + other._proteinsGrams,
      carbsGrams: this._carbsGrams + other._carbsGrams,
      fatsGrams: this._fatsGrams + other._fatsGrams,
      allowZeroTotal: true,
    });
  }

  public toPrimitives(): MacroNutrientsPrimitives {
    return {
      proteinsGrams: this._proteinsGrams,
      carbsGrams: this._carbsGrams,
      fatsGrams: this._fatsGrams,
      calories: this._calories,
    };
  }
}

