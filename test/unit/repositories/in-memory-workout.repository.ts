import { WorkoutPlan } from '../../../src/core/domain/entities/workout-plan.entity';
import { WorkoutRepositoryPort } from '../../../src/core/domain/ports/workout-repository.port';

export class InMemoryWorkoutRepository implements WorkoutRepositoryPort {
  private readonly items: Map<string, WorkoutPlan> = new Map();

  public async save(workoutPlan: WorkoutPlan): Promise<void> {
    this.items.set(workoutPlan.id, workoutPlan);
  }

  public async findById(id: string): Promise<WorkoutPlan | null> {
    return this.items.get(id) ?? null;
  }

  public async findByAthleteId(athleteId: string): Promise<WorkoutPlan[]> {
    const results: WorkoutPlan[] = [];
    for (const plan of this.items.values()) {
      if (plan.athleteId === athleteId) {
        results.push(plan);
      }
    }
    return results;
  }

  public async findActiveByAthleteId(athleteId: string): Promise<WorkoutPlan | null> {
    for (const plan of this.items.values()) {
      if (plan.athleteId === athleteId && plan.isActive) {
        return plan;
      }
    }
    return null;
  }

  public async delete(id: string): Promise<void> {
    this.items.delete(id);
  }

  public clear(): void {
    this.items.clear();
  }

  public count(): number {
    return this.items.size;
  }
}

