import { DomainError } from './domain.error';

export class InvalidRpeScoreError extends DomainError {
  constructor(value: number) {
    super(
      `O RPE (Rate of Perceived Exertion) informado (${value}) é inválido. O valor deve estar entre 1 e 10 (incrementos de 0.5 permitidos).`,
      'INVALID_RPE_SCORE',
    );
  }
}

