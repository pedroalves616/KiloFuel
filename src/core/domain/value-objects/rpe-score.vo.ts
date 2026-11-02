import { InvalidRpeScoreError } from '../errors/invalid-rpe-score.error';

export type RpeIntensityClassification =
  | 'LIGHT'
  | 'MODERATE'
  | 'HARD'
  | 'NEAR_MAXIMAL'
  | 'MAXIMAL';

export class RpeScore {
  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
    Object.freeze(this);
  }

  public static create(value: number): RpeScore {
    if (!RpeScore.isValid(value)) {
      throw new InvalidRpeScoreError(value);
    }
    return new RpeScore(value);
  }

  public static isValid(value: number): boolean {
    if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
      return false;
    }
    if (value < 1 || value > 10) {
      return false;
    }
    // Permite incrementos de 0.5 (ex: 7, 7.5, 8, 8.5, 9, 9.5, 10)
    return Number.isInteger(value * 2);
  }

  public get value(): number {
    return this._value;
  }

  /**
   * Calcula as Repetições em Reserva (RIR - Reps in Reserve) estimadas com base na escala RPE (10 - RPE).
   */
  public get estimatedRepsInReserve(): number {
    return Math.max(0, 10 - this._value);
  }

  public get intensityClassification(): RpeIntensityClassification {
    if (this._value < 5) return 'LIGHT';
    if (this._value < 7) return 'MODERATE';
    if (this._value < 8.5) return 'HARD';
    if (this._value < 10) return 'NEAR_MAXIMAL';
    return 'MAXIMAL';
  }

  public isHighFatigueRisk(): boolean {
    return this._value >= 9;
  }

  public equals(other: RpeScore): boolean {
    if (!other) return false;
    return this._value === other._value;
  }
}

