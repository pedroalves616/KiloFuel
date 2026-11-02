import { WorkoutPlan, WorkoutGoal } from '../../domain/entities/workout-plan.entity';
import { CreateWorkoutExercisePrimitives } from '../../domain/value-objects/workout-exercise.vo';

export interface CreateWorkoutExerciseInputDto {
  name: string;
  muscleGroup: string;
  sets: number;
  minReps: number;
  maxReps: number;
  targetRpe: number;
  restSeconds: number;
  notes?: string;
}

export interface CreateWorkoutInputDto {
  athleteId: string;
  name: string;
  description?: string;
  goal: WorkoutGoal;
  weeklyFrequency: number;
  exercises: CreateWorkoutExerciseInputDto[];
  deactivateExistingPlans?: boolean;
}

export interface WorkoutExerciseOutputDto extends CreateWorkoutExercisePrimitives {
  estimatedRepsInReserve: number;
  intensityClassification: string;
}

export interface WorkoutPlanOutputDto {
  id: string;
  athleteId: string;
  name: string;
  description?: string;
  goal: WorkoutGoal;
  weeklyFrequency: number;
  totalWorkingSets: number;
  averageTargetRpe: number;
  exercises: WorkoutExerciseOutputDto[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class WorkoutPlanOutputMapper {
  public static toOutput(workoutPlan: WorkoutPlan): WorkoutPlanOutputDto {
    return {
      id: workoutPlan.id,
      athleteId: workoutPlan.athleteId,
      name: workoutPlan.name,
      description: workoutPlan.description,
      goal: workoutPlan.goal,
      weeklyFrequency: workoutPlan.weeklyFrequency,
      totalWorkingSets: workoutPlan.totalWorkingSets,
      averageTargetRpe: workoutPlan.averageTargetRpe,
      exercises: workoutPlan.exercises.map((ex) => ({
        ...ex.toPrimitives(),
        estimatedRepsInReserve: ex.targetRpe.estimatedRepsInReserve,
        intensityClassification: ex.targetRpe.intensityClassification,
      })),
      isActive: workoutPlan.isActive,
      createdAt: workoutPlan.createdAt,
      updatedAt: workoutPlan.updatedAt,
    };
  }
}

