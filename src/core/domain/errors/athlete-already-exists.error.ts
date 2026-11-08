import { DomainError } from './domain.error';

export class AthleteAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(
      `Já existe um atleta cadastrado com o e-mail '${email}'.`,
      'ATHLETE_ALREADY_EXISTS',
    );
  }
}

