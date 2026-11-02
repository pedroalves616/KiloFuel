import { DomainError } from './domain.error';

export class InvalidWorkoutPlanError extends DomainError {
  constructor(reason: string) {
    super(`Plano de treino inválido: ${reason}`, 'INVALID_WORKOUT_PLAN');
  }
}

