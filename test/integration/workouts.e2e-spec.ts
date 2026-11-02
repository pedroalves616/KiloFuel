import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { WorkoutPlanModel } from '../../src/infrastructure/persistence/sequelize/models/workout-plan.model';
import { DomainExceptionFilter } from '../../src/presentation/filters/domain-exception.filter';

describe('Workouts Module E2E (PostgreSQL + Sequelize + NestJS)', () => {
  let app: INestApplication;
  const testAthleteId = `athlete-e2e-${Date.now()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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

  afterAll(async () => {
    await WorkoutPlanModel.destroy({
      where: { athleteId: testAthleteId },
    });
    await app.close();
  });

  it('deve persistir um plano de treino no PostgreSQL via POST /workouts e consultá-lo via GET /workouts/:id e GET /workouts/user/:userId', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/workouts')
      .send({
        athleteId: testAthleteId,
        name: 'Periodização Ondulatória E2E',
        description: 'Ciclo de força e hipertrofia validado no PostgreSQL 16',
        goal: 'STRENGTH',
        weeklyFrequency: 4,
        exercises: [
          {
            name: 'Agachamento Low Bar',
            muscleGroup: 'LEGS',
            sets: 5,
            minReps: 3,
            maxReps: 5,
            targetRpe: 8.5,
            restSeconds: 240,
            notes: 'Cinto a partir da 3ª série',
          },
          {
            name: 'Supino Pausado',
            muscleGroup: 'CHEST',
            sets: 4,
            minReps: 4,
            maxReps: 6,
            targetRpe: 8,
            restSeconds: 180,
          },
        ],
      })
      .expect(201);

    const createdId = createResponse.body.id;
    expect(createdId).toBeDefined();
    expect(createResponse.body.athleteId).toBe(testAthleteId);
    expect(createResponse.body.totalWorkingSets).toBe(9);
    expect(createResponse.body.averageTargetRpe).toBe(8.28);
    expect(createResponse.body.isActive).toBe(true);

    // Verifica diretamente no PostgreSQL via Sequelize Model se o registro foi salvo
    const persistedRow = await WorkoutPlanModel.findByPk(createdId);
    expect(persistedRow).not.toBeNull();
    expect(persistedRow?.name).toBe('Periodização Ondulatória E2E');
    expect(persistedRow?.exercises).toHaveLength(2);

    // Consulta via GET /workouts/:id
    const getByIdResponse = await request(app.getHttpServer())
      .get(`/workouts/${createdId}`)
      .expect(200);

    expect(getByIdResponse.body.id).toBe(createdId);
    expect(getByIdResponse.body.exercises[0].name).toBe('Agachamento Low Bar');
    expect(getByIdResponse.body.exercises[0].estimatedRepsInReserve).toBe(1.5);

    // Consulta via GET /workouts/user/:userId
    const listByUserResponse = await request(app.getHttpServer())
      .get(`/workouts/user/${testAthleteId}?onlyActive=true`)
      .expect(200);

    expect(listByUserResponse.body).toHaveLength(1);
    expect(listByUserResponse.body[0].id).toBe(createdId);
  });
});

