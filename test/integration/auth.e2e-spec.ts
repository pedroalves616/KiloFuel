import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { AthleteModel } from '../../src/infrastructure/persistence/sequelize/models/athlete.model';
import { DomainExceptionFilter } from '../../src/presentation/filters/domain-exception.filter';

describe('Auth Module E2E (Mobile Login + PostgreSQL + Sequelize)', () => {
  let app: INestApplication;
  const testEmail = `mobile.e2e.${Date.now()}@kilofuel.com`;

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
    await AthleteModel.destroy({
      where: { email: testEmail },
    });
    await app.close();
  });

  it('deve registrar, autenticar (login), consultar /auth/me e renovar sessão (/auth/refresh) no PostgreSQL', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Atleta E2E Mobile',
        email: testEmail,
        password: 'SuperSecurePassword2026!',
      })
      .expect(201);

    expect(registerResponse.body.accessToken).toBeDefined();
    expect(registerResponse.body.refreshToken).toBeDefined();
    expect(registerResponse.body.athlete.email).toBe(testEmail);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: 'SuperSecurePassword2026!',
      })
      .expect(200);

    const { accessToken, refreshToken } = loginResponse.body;

    const meResponse = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(meResponse.body.email).toBe(testEmail);
    expect(meResponse.body.name).toBe('Atleta E2E Mobile');

    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(refreshResponse.body.accessToken).toBeDefined();
    expect(refreshResponse.body.refreshToken).toBeDefined();
  });
});

