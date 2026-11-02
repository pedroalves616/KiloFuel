import { WorkoutRepositoryPort } from '../../domain/ports/workout-repository.port';
import {
  WorkoutPlanOutputDto,
  WorkoutPlanOutputMapper,
} from '../dtos/workout-plan-output.dto';

export interface ListWorkoutsByAthleteQuery {
  athleteId: string;
  onlyActive?: boolean;
}

export class ListWorkoutsByAthleteUseCase {
  constructor(private readonly workoutRepository: WorkoutRepositoryPort) {}

  public async execute(
    query: ListWorkoutsByAthleteQuery,
  ): Promise<WorkoutPlanOutputDto[]> {
    const plans = await this.workoutRepository.findByAthleteId(query.athleteId);

    const filteredPlans = query.onlyActive
      ? plans.filter((plan) => plan.isActive)
      : plans;

    return filteredPlans.map((plan) => WorkoutPlanOutputMapper.toOutput(plan));
  }
}

