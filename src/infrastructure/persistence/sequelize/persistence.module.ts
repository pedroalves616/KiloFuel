import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ATHLETE_REPOSITORY_PORT } from '../../../core/domain/ports/athlete-repository.port';
import { DIET_PLAN_REPOSITORY_PORT } from '../../../core/domain/ports/diet-plan-repository.port';
import { WORKOUT_REPOSITORY_PORT } from '../../../core/domain/ports/workout-repository.port';
import { buildSequelizeConfig } from './config/sequelize.config';
import { AthleteModel } from './models/athlete.model';
import { DietPlanModel } from './models/diet-plan.model';
import { WorkoutPlanModel } from './models/workout-plan.model';
import { SequelizeAthleteRepository } from './repositories/sequelize-athlete.repository';
import { SequelizeDietPlanRepository } from './repositories/sequelize-diet-plan.repository';
import { SequelizeWorkoutRepository } from './repositories/sequelize-workout.repository';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: buildSequelizeConfig,
    }),
    SequelizeModule.forFeature([
      WorkoutPlanModel,
      AthleteModel,
      DietPlanModel,
    ]),
  ],
  providers: [
    SequelizeWorkoutRepository,
    SequelizeAthleteRepository,
    SequelizeDietPlanRepository,
    {
      provide: WORKOUT_REPOSITORY_PORT,
      useExisting: SequelizeWorkoutRepository,
    },
    {
      provide: ATHLETE_REPOSITORY_PORT,
      useExisting: SequelizeAthleteRepository,
    },
    {
      provide: DIET_PLAN_REPOSITORY_PORT,
      useExisting: SequelizeDietPlanRepository,
    },
  ],
  exports: [
    WORKOUT_REPOSITORY_PORT,
    ATHLETE_REPOSITORY_PORT,
    DIET_PLAN_REPOSITORY_PORT,
    SequelizeModule,
  ],
})
export class PersistenceModule {}
