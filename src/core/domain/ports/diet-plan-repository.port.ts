import { DietPlan } from '../entities/diet-plan.entity';

export const DIET_PLAN_REPOSITORY_PORT = Symbol('DIET_PLAN_REPOSITORY_PORT');

export interface DietPlanRepositoryPort {
  save(dietPlan: DietPlan): Promise<void>;
  findById(id: string): Promise<DietPlan | null>;
  findByAthleteId(athleteId: string): Promise<DietPlan[]>;
  findActiveByAthleteId(athleteId: string): Promise<DietPlan | null>;
}

