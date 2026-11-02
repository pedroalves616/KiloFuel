import { WorkoutPlan } from '../entities/workout-plan.entity';

export const WORKOUT_REPOSITORY_PORT = Symbol('WORKOUT_REPOSITORY_PORT');
export const WORKOUT_PLAN_REPOSITORY_PORT = WORKOUT_REPOSITORY_PORT;

export interface WorkoutRepositoryPort {
  save(workoutPlan: WorkoutPlan): Promise<void>;
  findById(id: string): Promise<WorkoutPlan | null>;
  findByAthleteId(athleteId: string): Promise<WorkoutPlan[]>;
  findActiveByAthleteId(athleteId: string): Promise<WorkoutPlan | null>;
  delete(id: string): Promise<void>;
}

export type WorkoutPlanRepositoryPort = WorkoutRepositoryPort;

