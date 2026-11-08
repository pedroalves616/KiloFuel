import { InvalidWorkoutPlanError } from '../errors/invalid-workout-plan.error';
import { WorkoutExercise } from '../value-objects/workout-exercise.vo';

export type WorkoutGoal =
  | 'HYPERTROPHY'
  | 'STRENGTH'
  | 'ENDURANCE'
  | 'FAT_LOSS'
  | 'WEIGHT_LOSS'
  | 'GENERAL_FITNESS';

export interface CreateWorkoutPlanProps {
  id?: string;
  athleteId: string;
  name: string;
  description?: string;
  goal: WorkoutGoal;
  weeklyFrequency: number;
  exercises: WorkoutExercise[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReconstituteWorkoutPlanProps {
  id: string;
  athleteId: string;
  name: string;
  description?: string;
  goal: WorkoutGoal;
  weeklyFrequency: number;
  exercises: WorkoutExercise[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class WorkoutPlan {
  private readonly _id: string;
  private readonly _athleteId: string;
  private _name: string;
  private _description?: string;
  private _goal: WorkoutGoal;
  private _weeklyFrequency: number;
  private _exercises: WorkoutExercise[];
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ReconstituteWorkoutPlanProps) {
    this._id = props.id;
    this._athleteId = props.athleteId;
    this._name = props.name;
    this._description = props.description;
    this._goal = props.goal;
    this._weeklyFrequency = props.weeklyFrequency;
    this._exercises = [...props.exercises];
    this._isActive = props.isActive;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(props: CreateWorkoutPlanProps): WorkoutPlan {
    const now = new Date();
    const id = props.id?.trim() || crypto.randomUUID();

    WorkoutPlan.validateInvariants({
      athleteId: props.athleteId,
      name: props.name,
      weeklyFrequency: props.weeklyFrequency,
      exercises: props.exercises,
    });

    return new WorkoutPlan({
      id,
      athleteId: props.athleteId.trim(),
      name: props.name.trim(),
      description: props.description?.trim(),
      goal: props.goal,
      weeklyFrequency: props.weeklyFrequency,
      exercises: [...props.exercises],
      isActive: props.isActive ?? true,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  public static reconstitute(props: ReconstituteWorkoutPlanProps): WorkoutPlan {
    WorkoutPlan.validateInvariants({
      athleteId: props.athleteId,
      name: props.name,
      weeklyFrequency: props.weeklyFrequency,
      exercises: props.exercises,
    });

    if (!props.id || props.id.trim().length === 0) {
      throw new InvalidWorkoutPlanError('O ID do plano de treino é obrigatório na reconstituição.');
    }

    return new WorkoutPlan(props);
  }

  private static validateInvariants(params: {
    athleteId: string;
    name: string;
    weeklyFrequency: number;
    exercises: WorkoutExercise[];
  }): void {
    if (!params.athleteId || params.athleteId.trim().length === 0) {
      throw new InvalidWorkoutPlanError('O identificador do atleta (athleteId) é obrigatório.');
    }

    if (!params.name || params.name.trim().length < 3) {
      throw new InvalidWorkoutPlanError(
        'O nome do plano de treino deve possuir no mínimo 3 caracteres.',
      );
    }

    if (
      !Number.isInteger(params.weeklyFrequency) ||
      params.weeklyFrequency < 1 ||
      params.weeklyFrequency > 7
    ) {
      throw new InvalidWorkoutPlanError(
        `A frequência semanal (${params.weeklyFrequency}) deve ser um número inteiro entre 1 e 7 dias.`,
      );
    }

    if (!Array.isArray(params.exercises) || params.exercises.length === 0) {
      throw new InvalidWorkoutPlanError(
        'O plano de treino deve conter pelo menos 1 exercício prescrito.',
      );
    }
  }

  public addExercise(exercise: WorkoutExercise): void {
    const duplicate = this._exercises.some(
      (existing) => existing.name.toLowerCase() === exercise.name.toLowerCase(),
    );
    if (duplicate) {
      throw new InvalidWorkoutPlanError(
        `O exercício '${exercise.name}' já está incluído neste plano de treino.`,
      );
    }

    this._exercises.push(exercise);
    this.touch();
  }

  public removeExercise(exerciseName: string): void {
    if (this._exercises.length <= 1) {
      throw new InvalidWorkoutPlanError(
        'Não é possível remover o único exercício do plano de treino. O plano deve ter ao menos 1 exercício.',
      );
    }

    const initialLength = this._exercises.length;
    this._exercises = this._exercises.filter(
      (ex) => ex.name.toLowerCase() !== exerciseName.trim().toLowerCase(),
    );

    if (this._exercises.length === initialLength) {
      throw new InvalidWorkoutPlanError(
        `O exercício '${exerciseName}' não foi encontrado neste plano de treino.`,
      );
    }

    this.touch();
  }

  public updateWeeklyFrequency(newFrequency: number): void {
    if (!Number.isInteger(newFrequency) || newFrequency < 1 || newFrequency > 7) {
      throw new InvalidWorkoutPlanError(
        `A frequência semanal (${newFrequency}) deve ser um número inteiro entre 1 e 7 dias.`,
      );
    }
    this._weeklyFrequency = newFrequency;
    this.touch();
  }

  public activate(): void {
    this._isActive = true;
    this.touch();
  }

  public deactivate(): void {
    this._isActive = false;
    this.touch();
  }

  public toggleActive(): boolean {
    this._isActive = !this._isActive;
    this.touch();
    return this._isActive;
  }

  public get totalWorkingSets(): number {
    return this._exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  }

  public get averageTargetRpe(): number {
    if (this._exercises.length === 0) return 0;
    const totalWeightedRpe = this._exercises.reduce(
      (sum, ex) => sum + ex.targetRpe.value * ex.sets,
      0,
    );
    return Number((totalWeightedRpe / this.totalWorkingSets).toFixed(2));
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

  public get description(): string | undefined {
    return this._description;
  }

  public get goal(): WorkoutGoal {
    return this._goal;
  }

  public get weeklyFrequency(): number {
    return this._weeklyFrequency;
  }

  public get exercises(): ReadonlyArray<WorkoutExercise> {
    return [...this._exercises];
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

