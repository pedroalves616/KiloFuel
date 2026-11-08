import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DietPlan } from '../../../../core/domain/entities/diet-plan.entity';
import { DietPlanRepositoryPort } from '../../../../core/domain/ports/diet-plan-repository.port';
import { DietPlanMapper } from '../mappers/diet-plan.mapper';
import { DietPlanModel } from '../models/diet-plan.model';

@Injectable()
export class SequelizeDietPlanRepository implements DietPlanRepositoryPort {
  constructor(
    @InjectModel(DietPlanModel)
    private readonly dietPlanModel: typeof DietPlanModel,
  ) {}

  public async save(dietPlan: DietPlan): Promise<void> {
    const persistenceData = DietPlanMapper.toPersistence(dietPlan);
    await this.dietPlanModel.upsert(persistenceData);
  }

  public async findById(id: string): Promise<DietPlan | null> {
    const model = await this.dietPlanModel.findByPk(id);
    if (!model) {
      return null;
    }
    return DietPlanMapper.toDomain(model);
  }

  public async findByAthleteId(athleteId: string): Promise<DietPlan[]> {
    const models = await this.dietPlanModel.findAll({
      where: { athleteId },
      order: [['createdAt', 'DESC']],
    });

    return models.map((model) => DietPlanMapper.toDomain(model));
  }

  public async findActiveByAthleteId(
    athleteId: string,
  ): Promise<DietPlan | null> {
    const model = await this.dietPlanModel.findOne({
      where: { athleteId, isActive: true },
      order: [['createdAt', 'DESC']],
    });

    if (!model) {
      return null;
    }

    return DietPlanMapper.toDomain(model);
  }
}

