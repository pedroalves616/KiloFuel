import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { CreateWorkoutPlanUseCase } from '../../../src/core/application/use-cases/create-workout-plan.use-case';
import { GetWorkoutPlanByIdUseCase } from '../../../src/core/application/use-cases/get-workout-plan-by-id.use-case';
import { ListWorkoutsByAthleteUseCase } from '../../../src/core/application/use-cases/list-workouts-by-athlete.use-case';
import {
  WORKOUT_REPOSITORY_PORT,
  WorkoutRepositoryPort,
} from '../../../src/core/domain/ports/workout-repository.port';
import { WorkoutController } from '../../../src/presentation/controllers/workout.controller';
import { DomainExceptionFilter } from '../../../src/presentation/filters/domain-exception.filter';
import { InMemoryWorkoutRepository } from '../../unit/repositories/in-memory-workout.repository';

describe('WorkoutController + DomainExceptionFilter (HTTP Integration)', () => {
  let app: INestApplication;
  let repository: InMemoryWorkoutRepository;

  beforeEach(async () => {
    repository = new InMemoryWorkoutRepository();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutController],
      providers: [
        {
          provide: WORKOUT_REPOSITORY_PORT,
          useValue: repository,
        },
        {
          provide: CreateWorkoutPlanUseCase,
          useFactory: (repo: WorkoutRepositoryPort) =>
            new CreateWorkoutPlanUseCase(repo),
          inject: [WORKOUT_REPOSITORY_PORT],
        },
        {
          provide: GetWorkoutPlanByIdUseCase,
          useFactory: (repo: WorkoutRepositoryPort) =>
            new GetWorkoutPlanByIdUseCase(repo),
          inject: [WORKOUT_REPOSITORY_PORT],
        },
        {
          provide: ListWorkoutsByAthleteUseCase,
          useFactory: (repo: WorkoutRepositoryPort) =>
            new ListWorkoutsByAthleteUseCase(repo),
          inject: [WORKOUT_REPOSITORY_PORT],
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /workouts -> deve criar um plano de treino válido (201) e retornar DTO enriquecido', async () => {
    const response = await request(app.getHttpServer())
      .post('/workouts')
      .send({
        athleteId: 'athlete-http-1',
        name: 'Push Pull Legs',
        goal: 'HYPERTROPHY',
        weeklyFrequency: 6,
        exercises: [
          {
            name: 'Agachamento Livre',
            muscleGroup: 'LEGS',
            sets: 4,
            minReps: 6,
            maxReps: 8,
            targetRpe: 8.5,
            restSeconds: 180,
          },
        ],
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.athleteId).toBe('athlete-http-1');
    expect(response.body.totalWorkingSets).toBe(4);
    expect(response.body.averageTargetRpe).toBe(8.5);
  });

  it('POST /workouts -> deve retornar 400 via DomainExceptionFilter quando RPE possui incremento inválido (ex: 8.3)', async () => {
    const response = await request(app.getHttpServer())
      .post('/workouts')
      .send({
        athleteId: 'athlete-http-1',
        name: 'Push Pull Legs',
        goal: 'HYPERTROPHY',
        weeklyFrequency: 6,
        exercises: [
          {
            name: 'Agachamento Livre',
            muscleGroup: 'LEGS',
            sets: 4,
            minReps: 6,
            maxReps: 8,
            targetRpe: 8.3,
            restSeconds: 180,
          },
        ],
      })
      .expect(400);

    expect(response.body.code).toBe('INVALID_RPE_SCORE');
    expect(response.body.error).toBe('InvalidRpeScoreError');
  });

  it('GET /workouts/:id -> deve retornar 404 via DomainExceptionFilter quando plano não existe', async () => {
    const response = await request(app.getHttpServer())
      .get('/workouts/id-inexistente')
      .expect(404);

    expect(response.body.code).toBe('ENTITY_NOT_FOUND');
    expect(response.body.error).toBe('EntityNotFoundError');
  });

  it('GET /workouts/user/:userId -> deve listar os planos do atleta', async () => {
    await request(app.getHttpServer())
      .post('/workouts')
      .send({
        athleteId: 'athlete-list-1',
        name: 'Upper Body',
        goal: 'STRENGTH',
        weeklyFrequency: 4,
        exercises: [
          {
            name: 'Supino Reto',
            muscleGroup: 'CHEST',
            sets: 5,
            minReps: 5,
            maxReps: 5,
            targetRpe: 8,
            restSeconds: 180,
          },
        ],
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/workouts/user/athlete-list-1')
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Upper Body');
  });
});

