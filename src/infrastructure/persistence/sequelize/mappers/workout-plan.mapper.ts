import { WorkoutPlan } from '../../../../core/domain/entities/workout-plan.entity';
import { WorkoutExercise } from '../../../../core/domain/value-objects/workout-exercise.vo';
import {
  WorkoutPlanModel,
  WorkoutPlanPersistenceAttributes,
} from '../models/workout-plan.model';

export interface WorkoutPlanModelLike {
  get(options?: { plain: boolean }): WorkoutPlanPersistenceAttributes;
}

export class WorkoutPlanMapper {
  public static toDomain(
    model: WorkoutPlanModel | WorkoutPlanModelLike,
  ): WorkoutPlan {
    const rawData = model.get({ plain: true });

    const exercises = (rawData.exercises ?? []).map((exerciseData) =>
      WorkoutExercise.createFromPrimitives({
        name: exerciseData.name,
        muscleGroup: exerciseData.muscleGroup,
        sets: exerciseData.sets,
        minReps: exerciseData.minReps,
        maxReps: exerciseData.maxReps,
        targetRpe: exerciseData.targetRpe,
        restSeconds: exerciseData.restSeconds,
        notes: exerciseData.notes,
      }),
    );

    return WorkoutPlan.reconstitute({
      id: rawData.id,
      athleteId: rawData.athleteId,
      name: rawData.name,
      description: rawData.description ?? undefined,
      goal: rawData.goal,
      weeklyFrequency: rawData.weeklyFrequency,
      exercises,
      isActive: rawData.isActive,
      createdAt: new Date(rawData.createdAt),
      updatedAt: new Date(rawData.updatedAt),
    });
  }

  public static toPersistence(
    entity: WorkoutPlan,
  ): WorkoutPlanPersistenceAttributes {
    return {
      id: entity.id,
      athleteId: entity.athleteId,
      name: entity.name,
      description: entity.description ?? null,
      goal: entity.goal,
      weeklyFrequency: entity.weeklyFrequency,
      exercises: entity.exercises.map((exercise) => exercise.toPrimitives()),
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

