import { WorkoutPlan } from '../../../src/core/domain/entities/workout-plan.entity';
import { WorkoutExercise } from '../../../src/core/domain/value-objects/workout-exercise.vo';
import {
  WorkoutPlanMapper,
  WorkoutPlanModelLike,
} from '../../../src/infrastructure/persistence/sequelize/mappers/workout-plan.mapper';

describe('WorkoutPlanMapper (Data Mapper Unit Test)', () => {
  it('deve converter uma entidade de domínio WorkoutPlan para atributos de persistência e reconstituir via toDomain()', () => {
    const exercise = WorkoutExercise.createFromPrimitives({
      name: 'Supino Inclinado com Halteres',
      muscleGroup: 'CHEST',
      sets: 4,
      minReps: 8,
      maxReps: 10,
      targetRpe: 8.5,
      restSeconds: 120,
      notes: 'Controle excêntrico de 2s',
    });

    const originalEntity = WorkoutPlan.create({
      id: '550e8400-e29b-41d4-a716-446655440000',
      athleteId: 'athlete-001',
      name: 'Push Day A',
      description: 'Treino de empurrar focado em porção clavicular',
      goal: 'HYPERTROPHY',
      weeklyFrequency: 5,
      exercises: [exercise],
      isActive: true,
    });

    const persistenceAttrs = WorkoutPlanMapper.toPersistence(originalEntity);

    expect(persistenceAttrs).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      athleteId: 'athlete-001',
      name: 'Push Day A',
      description: 'Treino de empurrar focado em porção clavicular',
      goal: 'HYPERTROPHY',
      weeklyFrequency: 5,
      exercises: [
        {
          name: 'Supino Inclinado com Halteres',
          muscleGroup: 'CHEST',
          sets: 4,
          minReps: 8,
          maxReps: 10,
          targetRpe: 8.5,
          restSeconds: 120,
          notes: 'Controle excêntrico de 2s',
        },
      ],
      isActive: true,
      createdAt: originalEntity.createdAt,
      updatedAt: originalEntity.updatedAt,
    });

    const fakeModel: WorkoutPlanModelLike = {
      get: () => persistenceAttrs,
    };

    const reconstitutedEntity = WorkoutPlanMapper.toDomain(fakeModel);

    expect(reconstitutedEntity).toBeInstanceOf(WorkoutPlan);
    expect(reconstitutedEntity.id).toBe(originalEntity.id);
    expect(reconstitutedEntity.athleteId).toBe(originalEntity.athleteId);
    expect(reconstitutedEntity.totalWorkingSets).toBe(4);
    expect(reconstitutedEntity.averageTargetRpe).toBe(8.5);
    expect(reconstitutedEntity.exercises[0].equals(exercise)).toBe(true);
  });
});

