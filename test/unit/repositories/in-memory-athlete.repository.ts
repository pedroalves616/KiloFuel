import { Athlete } from '../../../src/core/domain/entities/athlete.entity';
import { AthleteRepositoryPort } from '../../../src/core/domain/ports/athlete-repository.port';

export class InMemoryAthleteRepository implements AthleteRepositoryPort {
  private readonly items: Map<string, Athlete> = new Map();

  public async save(athlete: Athlete): Promise<void> {
    this.items.set(athlete.id, athlete);
  }

  public async findById(id: string): Promise<Athlete | null> {
    return this.items.get(id) ?? null;
  }

  public async findByEmail(email: string): Promise<Athlete | null> {
    const normalized = email.trim().toLowerCase();
    for (const athlete of this.items.values()) {
      if (athlete.email.value === normalized) {
        return athlete;
      }
    }
    return null;
  }

  public clear(): void {
    this.items.clear();
  }
}

