import { CreateWorkoutPlanUseCase } from '../../../src/core/application/use-cases/create-workout-plan.use-case';
import { GetWorkoutPlanByIdUseCase } from '../../../src/core/application/use-cases/get-workout-plan-by-id.use-case';
import { ListWorkoutsByAthleteUseCase } from '../../../src/core/application/use-cases/list-workouts-by-athlete.use-case';
import { EntityNotFoundError } from '../../../src/core/domain/errors/entity-not-found.error';
import { InvalidRpeScoreError } from '../../../src/core/domain/errors/invalid-rpe-score.error';
import { InvalidWorkoutPlanError } from '../../../src/core/domain/errors/invalid-workout-plan.error';
import { InMemoryWorkoutRepository } from '../repositories/in-memory-workout.repository';

describe('Workout Plan Use Cases (Application & Domain Unit Tests)', () => {
  let repository: InMemoryWorkoutRepository;
  let createWorkoutPlanUseCase: CreateWorkoutPlanUseCase;
  let getWorkoutPlanByIdUseCase: GetWorkoutPlanByIdUseCase;
  let listWorkoutsByAthleteUseCase: ListWorkoutsByAthleteUseCase;

  beforeEach(() => {
    repository = new InMemoryWorkoutRepository();
    createWorkoutPlanUseCase = new CreateWorkoutPlanUseCase(repository);
    getWorkoutPlanByIdUseCase = new GetWorkoutPlanByIdUseCase(repository);
    listWorkoutsByAthleteUseCase = new ListWorkoutsByAthleteUseCase(repository);
  });

  describe('CreateWorkoutPlanUseCase', () => {
    it('deve criar um plano de treino válido, calcular volume/RPE médio e persistir no repositório', async () => {
      const output = await createWorkoutPlanUseCase.execute({
        athleteId: 'athlete-123',
        name: 'Upper / Lower Hipertrofia',
        description: 'Foco em progressão de carga nos básicos',
        goal: 'HYPERTROPHY',
        weeklyFrequency: 4,
        exercises: [
          {
            name: 'Supino Reto com Barra',
            muscleGroup: 'chest',
            sets: 4,
            minReps: 6,
            maxReps: 8,
            targetRpe: 8.5,
            restSeconds: 180,
            notes: 'Pausa de 1s no peito',
          },
          {
            name: 'Remada Curvada',
            muscleGroup: 'back',
            sets: 4,
            minReps: 8,
            maxReps: 10,
            targetRpe: 8,
            restSeconds: 120,
          },
        ],
      });

      expect(output.id).toBeDefined();
      expect(output.athleteId).toBe('athlete-123');
      expect(output.name).toBe('Upper / Lower Hipertrofia');
      expect(output.isActive).toBe(true);
      expect(output.totalWorkingSets).toBe(8);
      expect(output.averageTargetRpe).toBe(8.25);
      expect(output.exercises).toHaveLength(2);
      expect(output.exercises[0].muscleGroup).toBe('CHEST');
      expect(output.exercises[0].estimatedRepsInReserve).toBe(1.5);
      expect(output.exercises[0].intensityClassification).toBe('NEAR_MAXIMAL');
      expect(repository.count()).toBe(1);
    });

    it('deve desativar automaticamente o plano anterior ativo do mesmo atleta ao criar um novo plano', async () => {
      const firstPlan = await createWorkoutPlanUseCase.execute({
        athleteId: 'athlete-123',
        name: 'Fase 1 - Base',
        goal: 'STRENGTH',
        weeklyFrequency: 3,
        exercises: [
          {
            name: 'Agachamento Livre',
            muscleGroup: 'LEGS',
            sets: 5,
            minReps: 5,
            maxReps: 5,
            targetRpe: 8,
            restSeconds: 180,
          },
        ],
      });

      const secondPlan = await createWorkoutPlanUseCase.execute({
        athleteId: 'athlete-123',
        name: 'Fase 2 - Intensificação',
        goal: 'STRENGTH',
        weeklyFrequency: 4,
        exercises: [
          {
            name: 'Levantamento Terra',
            muscleGroup: 'BACK',
            sets: 3,
            minReps: 3,
            maxReps: 5,
            targetRpe: 9,
            restSeconds: 240,
          },
        ],
      });

      const reloadedFirstPlan = await getWorkoutPlanByIdUseCase.execute(firstPlan.id);
      const reloadedSecondPlan = await getWorkoutPlanByIdUseCase.execute(secondPlan.id);

      expect(reloadedFirstPlan.isActive).toBe(false);
      expect(reloadedSecondPlan.isActive).toBe(true);
    });

    it('deve lançar InvalidRpeScoreError quando o RPE alvo estiver fora da escala (1 a 10)', async () => {
      await expect(
        createWorkoutPlanUseCase.execute({
          athleteId: 'athlete-123',
          name: 'Treino Inválido',
          goal: 'HYPERTROPHY',
          weeklyFrequency: 4,
          exercises: [
            {
              name: 'Rosca Direta',
              muscleGroup: 'BICEPS',
              sets: 3,
              minReps: 8,
              maxReps: 12,
              targetRpe: 11,
              restSeconds: 90,
            },
          ],
        }),
      ).rejects.toThrow(InvalidRpeScoreError);
    });

    it('deve lançar InvalidWorkoutPlanError quando a frequência semanal ou lista de exercícios for inválida', async () => {
      await expect(
        createWorkoutPlanUseCase.execute({
          athleteId: 'athlete-123',
          name: 'Treino Sem Exercícios',
          goal: 'HYPERTROPHY',
          weeklyFrequency: 4,
          exercises: [],
        }),
      ).rejects.toThrow(InvalidWorkoutPlanError);

      await expect(
        createWorkoutPlanUseCase.execute({
          athleteId: 'athlete-123',
          name: 'Frequência Inválida',
          goal: 'HYPERTROPHY',
          weeklyFrequency: 8,
          exercises: [
            {
              name: 'Agachamento',
              muscleGroup: 'LEGS',
              sets: 4,
              minReps: 6,
              maxReps: 8,
              targetRpe: 8,
              restSeconds: 120,
            },
          ],
        }),
      ).rejects.toThrow(InvalidWorkoutPlanError);
    });
  });

  describe('GetWorkoutPlanByIdUseCase', () => {
    it('deve retornar os detalhes do plano de treino existente pelo ID', async () => {
      const created = await createWorkoutPlanUseCase.execute({
        athleteId: 'athlete-999',
        name: 'Fullbody 3x',
        goal: 'GENERAL_FITNESS',
        weeklyFrequency: 3,
        exercises: [
          {
            name: 'Desenvolvimento Militar',
            muscleGroup: 'SHOULDERS',
            sets: 3,
            minReps: 8,
            maxReps: 10,
            targetRpe: 7.5,
            restSeconds: 120,
          },
        ],
      });

      const found = await getWorkoutPlanByIdUseCase.execute(created.id);

      expect(found.id).toBe(created.id);
      expect(found.name).toBe('Fullbody 3x');
      expect(found.exercises).toHaveLength(1);
    });

    it('deve lançar EntityNotFoundError quando o ID não existir', async () => {
      await expect(
        getWorkoutPlanByIdUseCase.execute('non-existent-id'),
      ).rejects.toThrow(EntityNotFoundError);
    });
  });

  describe('ListWorkoutsByAthleteUseCase', () => {
    it('deve listar todos os planos de um atleta ou filtrar apenas os ativos', async () => {
      await createWorkoutPlanUseCase.execute({
        athleteId: 'athlete-abc',
        name: 'Treino Antigo',
        goal: 'ENDURANCE',
        weeklyFrequency: 3,
        exercises: [
          {
            name: 'Afundo',
            muscleGroup: 'LEGS',
            sets: 3,
            minReps: 12,
            maxReps: 15,
            targetRpe: 7,
            restSeconds: 60,
          },
        ],
      });

      await createWorkoutPlanUseCase.execute({
        athleteId: 'athlete-abc',
        name: 'Treino Atual',
        goal: 'HYPERTROPHY',
        weeklyFrequency: 5,
        exercises: [
          {
            name: 'Leg Press 45',
            muscleGroup: 'LEGS',
            sets: 4,
            minReps: 8,
            maxReps: 10,
            targetRpe: 8.5,
            restSeconds: 120,
          },
        ],
      });

      const allPlans = await listWorkoutsByAthleteUseCase.execute({
        athleteId: 'athlete-abc',
      });
      const activeOnly = await listWorkoutsByAthleteUseCase.execute({
        athleteId: 'athlete-abc',
        onlyActive: true,
      });

      expect(allPlans).toHaveLength(2);
      expect(activeOnly).toHaveLength(1);
      expect(activeOnly[0].name).toBe('Treino Atual');
    });
  });
});

