import { Athlete } from '../../../../core/domain/entities/athlete.entity';
import { Email } from '../../../../core/domain/value-objects/email.vo';
import {
  AthleteModel,
  AthletePersistenceAttributes,
} from '../models/athlete.model';

export interface AthleteModelLike {
  get(options?: { plain: boolean }): AthletePersistenceAttributes;
}

export class AthleteMapper {
  public static toDomain(model: AthleteModel | AthleteModelLike): Athlete {
    const rawData = model.get({ plain: true });

    return Athlete.reconstitute({
      id: rawData.id,
      name: rawData.name,
      email: Email.create(rawData.email),
      passwordHash: rawData.passwordHash,
      isActive: rawData.isActive,
      createdAt: new Date(rawData.createdAt),
      updatedAt: new Date(rawData.updatedAt),
    });
  }

  public static toPersistence(entity: Athlete): AthletePersistenceAttributes {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email.value,
      passwordHash: entity.passwordHash,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

