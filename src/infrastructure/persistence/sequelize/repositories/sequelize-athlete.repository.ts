import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Athlete } from '../../../../core/domain/entities/athlete.entity';
import { AthleteRepositoryPort } from '../../../../core/domain/ports/athlete-repository.port';
import { AthleteMapper } from '../mappers/athlete.mapper';
import { AthleteModel } from '../models/athlete.model';

@Injectable()
export class SequelizeAthleteRepository implements AthleteRepositoryPort {
  constructor(
    @InjectModel(AthleteModel)
    private readonly athleteModel: typeof AthleteModel,
  ) {}

  public async save(athlete: Athlete): Promise<void> {
    const persistenceData = AthleteMapper.toPersistence(athlete);
    await this.athleteModel.upsert(persistenceData);
  }

  public async findById(id: string): Promise<Athlete | null> {
    const model = await this.athleteModel.findByPk(id);
    if (!model) {
      return null;
    }
    return AthleteMapper.toDomain(model);
  }

  public async findByEmail(email: string): Promise<Athlete | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const model = await this.athleteModel.findOne({
      where: { email: normalizedEmail },
    });

    if (!model) {
      return null;
    }

    return AthleteMapper.toDomain(model);
  }
}

