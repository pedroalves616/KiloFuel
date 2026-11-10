import { Module } from '@nestjs/common';
import { CalculateDietPlanUseCase } from '../core/application/use-cases/calculate-diet-plan.use-case';
import { GetDietPlanByIdUseCase } from '../core/application/use-cases/get-diet-plan-by-id.use-case';
import { ListDietsByAthleteUseCase } from '../core/application/use-cases/list-diets-by-athlete.use-case';
import { LogDailyMealConsumptionUseCase } from '../core/application/use-cases/log-daily-meal-consumption.use-case';
import {
  DIET_PLAN_REPOSITORY_PORT,
  DietPlanRepositoryPort,
} from '../core/domain/ports/diet-plan-repository.port';
import { PersistenceModule } from '../infrastructure/persistence/sequelize/persistence.module';
import { DietsController } from './controllers/diets.controller';

@Module({
  imports: [PersistenceModule],
  controllers: [DietsController],
  providers: [
    {
      provide: CalculateDietPlanUseCase,
      useFactory: (repo: DietPlanRepositoryPort) =>
        new CalculateDietPlanUseCase(repo),
      inject: [DIET_PLAN_REPOSITORY_PORT],
    },
    {
      provide: ListDietsByAthleteUseCase,
      useFactory: (repo: DietPlanRepositoryPort) =>
        new ListDietsByAthleteUseCase(repo),
      inject: [DIET_PLAN_REPOSITORY_PORT],
    },
    {
      provide: GetDietPlanByIdUseCase,
      useFactory: (repo: DietPlanRepositoryPort) =>
        new GetDietPlanByIdUseCase(repo),
      inject: [DIET_PLAN_REPOSITORY_PORT],
    },
    {
      provide: LogDailyMealConsumptionUseCase,
      useFactory: (repo: DietPlanRepositoryPort) =>
        new LogDailyMealConsumptionUseCase(repo),
      inject: [DIET_PLAN_REPOSITORY_PORT],
    },
  ],
  exports: [
    CalculateDietPlanUseCase,
    ListDietsByAthleteUseCase,
    GetDietPlanByIdUseCase,
    LogDailyMealConsumptionUseCase,
  ],
})
export class DietModule {}

