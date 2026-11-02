import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { WORKOUT_REPOSITORY_PORT } from '../../../core/domain/ports/workout-repository.port';
import { buildSequelizeConfig } from './config/sequelize.config';
import { WorkoutPlanModel } from './models/workout-plan.model';
import { SequelizeWorkoutRepository } from './repositories/sequelize-workout.repository';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: buildSequelizeConfig,
    }),
    SequelizeModule.forFeature([WorkoutPlanModel]),
  ],
  providers: [
    SequelizeWorkoutRepository,
    {
      provide: WORKOUT_REPOSITORY_PORT,
      useExisting: SequelizeWorkoutRepository,
    },
  ],
  exports: [WORKOUT_REPOSITORY_PORT, SequelizeModule],
})
export class PersistenceModule {}
