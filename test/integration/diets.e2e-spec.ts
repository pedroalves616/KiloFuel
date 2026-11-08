import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DietPlanModel } from '../../src/infrastructure/persistence/sequelize/models/diet-plan.model';
import { DomainExceptionFilter } from '../../src/presentation/filters/domain-exception.filter';

describe('Diets Module E2E (PostgreSQL + Sequelize + NestJS)', () => {
  let app: INestApplication;
  const testAthleteId = `athlete-diet-e2e-${Date.now()}`;

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
    await DietPlanModel.destroy({
      where: { athleteId: testAthleteId },
    });
    await app.close();
  });

  it('deve criar um plano alimentar (POST /diets), registrar refeição (POST /diets/:id/meals) e atualizar calorias/macros no PostgreSQL', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/diets')
      .send({
        athleteId: testAthleteId,
        name: 'Bulking Controlado E2E',
        goal: 'BULKING',
        targetProteinsGrams: 180,
        targetCarbsGrams: 300,
        targetFatsGrams: 70,
      })
      .expect(201);

    const dietId = createRes.body.id;
    expect(dietId).toBeDefined();
    // 180*4 (720) + 300*4 (1200) + 70*9 (630) = 2550 kcal
    expect(createRes.body.targetCalories).toBe(2550);
    expect(createRes.body.consumedCalories).toBe(0);
    expect(createRes.body.remainingCalories).toBe(2550);

    const mealRes = await request(app.getHttpServer())
      .post(`/diets/${dietId}/meals`)
      .send({
        name: 'Almoço Pós-Treino',
        time: '13:00',
        proteinsGrams: 50,
        carbsGrams: 80,
        fatsGrams: 15,
      })
      .expect(201);

    // 50*4 (200) + 80*4 (320) + 15*9 (135) = 655 kcal
    expect(mealRes.body.consumedCalories).toBe(655);
    expect(mealRes.body.remainingCalories).toBe(1895);
    expect(mealRes.body.meals).toHaveLength(1);

    const listRes = await request(app.getHttpServer())
      .get(`/diets/user/${testAthleteId}`)
      .expect(200);

    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].consumedCalories).toBe(655);
  });
});

