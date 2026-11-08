import { DomainError } from './domain.error';

export class InvalidDietPlanError extends DomainError {
  constructor(reason: string) {
    super(`Plano alimentar inválido: ${reason}`, 'INVALID_DIET_PLAN');
  }
}

