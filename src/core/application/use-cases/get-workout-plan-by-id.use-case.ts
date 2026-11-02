import { EntityNotFoundError } from '../../domain/errors/entity-not-found.error';
import { WorkoutRepositoryPort } from '../../domain/ports/workout-repository.port';
import {
  WorkoutPlanOutputDto,
  WorkoutPlanOutputMapper,
} from '../dtos/workout-plan-output.dto';

export class GetWorkoutPlanByIdUseCase {
  constructor(private readonly workoutRepository: WorkoutRepositoryPort) {}

  public async execute(workoutPlanId: string): Promise<WorkoutPlanOutputDto> {
    const workoutPlan = await this.workoutRepository.findById(workoutPlanId);

    if (!workoutPlan) {
      throw new EntityNotFoundError('WorkoutPlan', workoutPlanId);
    }

    return WorkoutPlanOutputMapper.toOutput(workoutPlan);
  }
}

