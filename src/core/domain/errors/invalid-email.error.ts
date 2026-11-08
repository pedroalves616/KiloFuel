import { DomainError } from './domain.error';

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(
      `O endereço de e-mail informado ('${email}') possui formato inválido.`,
      'INVALID_EMAIL',
    );
  }
}

