import { InvalidWorkoutPlanError } from '../errors/invalid-workout-plan.error';
import { RpeScore } from './rpe-score.vo';

export interface WorkoutExerciseProps {
  name: string;
  muscleGroup: string;
  sets: number;
  minReps: number;
  maxReps: number;
  targetRpe: RpeScore;
  restSeconds: number;
  notes?: string;
}

export interface CreateWorkoutExercisePrimitives {
  name: string;
  muscleGroup: string;
  sets: number;
  minReps: number;
  maxReps: number;
  targetRpe: number;
  restSeconds: number;
  notes?: string;
}

export class WorkoutExercise {
  private readonly _name: string;
  private readonly _muscleGroup: string;
  private readonly _sets: number;
  private readonly _minReps: number;
  private readonly _maxReps: number;
  private readonly _targetRpe: RpeScore;
  private readonly _restSeconds: number;
  private readonly _notes?: string;

  private constructor(props: WorkoutExerciseProps) {
    this._name = props.name;
    this._muscleGroup = props.muscleGroup;
    this._sets = props.sets;
    this._minReps = props.minReps;
    this._maxReps = props.maxReps;
    this._targetRpe = props.targetRpe;
    this._restSeconds = props.restSeconds;
    this._notes = props.notes;
    Object.freeze(this);
  }

  public static create(props: WorkoutExerciseProps): WorkoutExercise {
    WorkoutExercise.validate(props);

    return new WorkoutExercise({
      ...props,
      name: props.name.trim(),
      muscleGroup: props.muscleGroup.trim().toUpperCase(),
      notes: props.notes?.trim(),
    });
  }

  public static createFromPrimitives(primitives: CreateWorkoutExercisePrimitives): WorkoutExercise {
    const targetRpe = RpeScore.create(primitives.targetRpe);
    return WorkoutExercise.create({
      name: primitives.name,
      muscleGroup: primitives.muscleGroup,
      sets: primitives.sets,
      minReps: primitives.minReps,
      maxReps: primitives.maxReps,
      targetRpe,
      restSeconds: primitives.restSeconds,
      notes: primitives.notes,
    });
  }

  private static validate(props: WorkoutExerciseProps): void {
    if (!props.name || props.name.trim().length < 2) {
      throw new InvalidWorkoutPlanError(
        'O nome do exercício deve possuir pelo menos 2 caracteres.',
      );
    }

    if (!props.muscleGroup || props.muscleGroup.trim().length < 2) {
      throw new InvalidWorkoutPlanError(
        'O grupamento muscular do exercício deve ser informado.',
      );
    }

    if (!Number.isInteger(props.sets) || props.sets < 1 || props.sets > 20) {
      throw new InvalidWorkoutPlanError(
        `O número de séries (${props.sets}) deve ser um inteiro entre 1 e 20.`,
      );
    }

    if (!Number.isInteger(props.minReps) || props.minReps < 1 || props.minReps > 100) {
      throw new InvalidWorkoutPlanError(
        `O número mínimo de repetições (${props.minReps}) deve ser um inteiro entre 1 e 100.`,
      );
    }

    if (!Number.isInteger(props.maxReps) || props.maxReps < props.minReps || props.maxReps > 100) {
      throw new InvalidWorkoutPlanError(
        `O número máximo de repetições (${props.maxReps}) deve ser um inteiro maior ou igual ao mínimo (${props.minReps}) e até 100.`,
      );
    }

    if (!Number.isInteger(props.restSeconds) || props.restSeconds < 0 || props.restSeconds > 900) {
      throw new InvalidWorkoutPlanError(
        `O tempo de descanso (${props.restSeconds}s) deve ser um inteiro entre 0 e 900 segundos.`,
      );
    }

    if (!props.targetRpe) {
      throw new InvalidWorkoutPlanError('O RPE alvo do exercício é obrigatório.');
    }
  }

  public get name(): string {
    return this._name;
  }

  public get muscleGroup(): string {
    return this._muscleGroup;
  }

  public get sets(): number {
    return this._sets;
  }

  public get minReps(): number {
    return this._minReps;
  }

  public get maxReps(): number {
    return this._maxReps;
  }

  public get targetRpe(): RpeScore {
    return this._targetRpe;
  }

  public get restSeconds(): number {
    return this._restSeconds;
  }

  public get notes(): string | undefined {
    return this._notes;
  }

  public equals(other: WorkoutExercise): boolean {
    if (!other) return false;
    return (
      this._name.toLowerCase() === other._name.toLowerCase() &&
      this._muscleGroup === other._muscleGroup &&
      this._sets === other._sets &&
      this._minReps === other._minReps &&
      this._maxReps === other._maxReps &&
      this._targetRpe.equals(other._targetRpe) &&
      this._restSeconds === other._restSeconds &&
      this._notes === other._notes
    );
  }

  public toPrimitives(): CreateWorkoutExercisePrimitives {
    return {
      name: this._name,
      muscleGroup: this._muscleGroup,
      sets: this._sets,
      minReps: this._minReps,
      maxReps: this._maxReps,
      targetRpe: this._targetRpe.value,
      restSeconds: this._restSeconds,
      notes: this._notes,
    };
  }
}

