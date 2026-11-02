import { Module } from '@nestjs/common';
import { CreateWorkoutPlanUseCase } from '../core/application/use-cases/create-workout-plan.use-case';
import { GetWorkoutPlanByIdUseCase } from '../core/application/use-cases/get-workout-plan-by-id.use-case';
import { ListWorkoutsByAthleteUseCase } from '../core/application/use-cases/list-workouts-by-athlete.use-case';
import {
  WORKOUT_REPOSITORY_PORT,
  WorkoutRepositoryPort,
} from '../core/domain/ports/workout-repository.port';
import { PersistenceModule } from '../infrastructure/persistence/sequelize/persistence.module';
import { WorkoutController } from './controllers/workout.controller';

@Module({
  imports: [PersistenceModule],
  controllers: [WorkoutController],
  providers: [
    {
      provide: CreateWorkoutPlanUseCase,
      useFactory: (workoutRepository: WorkoutRepositoryPort) =>
        new CreateWorkoutPlanUseCase(workoutRepository),
      inject: [WORKOUT_REPOSITORY_PORT],
    },
    {
      provide: GetWorkoutPlanByIdUseCase,
      useFactory: (workoutRepository: WorkoutRepositoryPort) =>
        new GetWorkoutPlanByIdUseCase(workoutRepository),
      inject: [WORKOUT_REPOSITORY_PORT],
    },
    {
      provide: ListWorkoutsByAthleteUseCase,
      useFactory: (workoutRepository: WorkoutRepositoryPort) =>
        new ListWorkoutsByAthleteUseCase(workoutRepository),
      inject: [WORKOUT_REPOSITORY_PORT],
    },
  ],
  exports: [
    CreateWorkoutPlanUseCase,
    GetWorkoutPlanByIdUseCase,
    ListWorkoutsByAthleteUseCase,
  ],
})
export class WorkoutModule {}

