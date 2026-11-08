import { DomainError } from './domain.error';

export class InvalidCredentialsError extends DomainError {
  constructor(message = 'Credenciais de autenticação inválidas ou expiradas.') {
    super(message, 'INVALID_CREDENTIALS');
  }
}

