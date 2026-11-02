import { DomainError } from './domain.error';

export class EntityNotFoundError extends DomainError {
  constructor(entityName: string, identifier: string) {
    super(
      `${entityName} com identificador '${identifier}' não foi encontrado(a).`,
      'ENTITY_NOT_FOUND',
    );
  }
}

