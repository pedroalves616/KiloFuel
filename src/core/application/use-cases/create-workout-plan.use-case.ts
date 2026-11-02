import { WorkoutPlan } from '../../domain/entities/workout-plan.entity';
import { WorkoutRepositoryPort } from '../../domain/ports/workout-repository.port';
import { WorkoutExercise } from '../../domain/value-objects/workout-exercise.vo';
import {
  CreateWorkoutInputDto,
  WorkoutPlanOutputDto,
  WorkoutPlanOutputMapper,
} from '../dtos/create-workout-input.dto';

export class CreateWorkoutPlanUseCase {
  constructor(private readonly workoutRepository: WorkoutRepositoryPort) {}

  public async execute(input: CreateWorkoutInputDto): Promise<WorkoutPlanOutputDto> {
    const exercises = (input.exercises ?? []).map((exerciseDto) =>
      WorkoutExercise.createFromPrimitives({
        name: exerciseDto.name,
        muscleGroup: exerciseDto.muscleGroup,
        sets: exerciseDto.sets,
        minReps: exerciseDto.minReps,
        maxReps: exerciseDto.maxReps,
        targetRpe: exerciseDto.targetRpe,
        restSeconds: exerciseDto.restSeconds,
        notes: exerciseDto.notes,
      }),
    );

    const workoutPlan = WorkoutPlan.create({
      athleteId: input.athleteId,
      name: input.name,
      description: input.description,
      goal: input.goal,
      weeklyFrequency: input.weeklyFrequency,
      exercises,
      isActive: true,
    });

    const shouldDeactivateExisting = input.deactivateExistingPlans ?? true;
    if (shouldDeactivateExisting) {
      const currentActivePlan = await this.workoutRepository.findActiveByAthleteId(
        workoutPlan.athleteId,
      );

      if (currentActivePlan) {
        currentActivePlan.deactivate();
        await this.workoutRepository.save(currentActivePlan);
      }
    }

    await this.workoutRepository.save(workoutPlan);

    return WorkoutPlanOutputMapper.toOutput(workoutPlan);
  }
}

