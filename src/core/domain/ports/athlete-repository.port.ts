import { Athlete } from '../entities/athlete.entity';

export const ATHLETE_REPOSITORY_PORT = Symbol('ATHLETE_REPOSITORY_PORT');

export interface AthleteRepositoryPort {
  save(athlete: Athlete): Promise<void>;
  findById(id: string): Promise<Athlete | null>;
  findByEmail(email: string): Promise<Athlete | null>;
}

