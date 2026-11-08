import { DomainError } from './domain.error';

export class InvalidAthleteError extends DomainError {
  constructor(reason: string) {
    super(`Dados do atleta inválidos: ${reason}`, 'INVALID_ATHLETE');
  }
}

