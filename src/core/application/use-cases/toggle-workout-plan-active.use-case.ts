import { EntityNotFoundError } from '../../domain/errors/entity-not-found.error';
import { WorkoutRepositoryPort } from '../../domain/ports/workout-repository.port';
import {
  WorkoutPlanOutputDto,
  WorkoutPlanOutputMapper,
} from '../dtos/workout-plan-output.dto';

export class ToggleWorkoutPlanActiveUseCase {
  constructor(private readonly workoutRepository: WorkoutRepositoryPort) {}

  public async execute(workoutPlanId: string): Promise<WorkoutPlanOutputDto> {
    const workoutPlan = await this.workoutRepository.findById(workoutPlanId);
    if (!workoutPlan) {
      throw new EntityNotFoundError('WorkoutPlan', workoutPlanId);
    }

    const willActivate = !workoutPlan.isActive;
    if (willActivate) {
      const currentActive = await this.workoutRepository.findActiveByAthleteId(
        workoutPlan.athleteId,
      );
      if (currentActive && currentActive.id !== workoutPlan.id) {
        currentActive.deactivate();
        await this.workoutRepository.save(currentActive);
      }
    }

    workoutPlan.toggleActive();
    await this.workoutRepository.save(workoutPlan);

    return WorkoutPlanOutputMapper.toOutput(workoutPlan);
  }
}

