import { DomainError } from './domain.error';

export class InvalidMacroDistributionError extends DomainError {
  constructor(reason: string) {
    super(
      `Distribuição de macronutrientes inválida: ${reason}`,
      'INVALID_MACRO_DISTRIBUTION',
    );
  }
}

