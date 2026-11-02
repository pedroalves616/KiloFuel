import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { WorkoutPlan } from '../../../../core/domain/entities/workout-plan.entity';
import { WorkoutRepositoryPort } from '../../../../core/domain/ports/workout-repository.port';
import { WorkoutPlanMapper } from '../mappers/workout-plan.mapper';
import { WorkoutPlanModel } from '../models/workout-plan.model';

@Injectable()
export class SequelizeWorkoutRepository implements WorkoutRepositoryPort {
  constructor(
    @InjectModel(WorkoutPlanModel)
    private readonly workoutPlanModel: typeof WorkoutPlanModel,
  ) {}

  public async save(workoutPlan: WorkoutPlan): Promise<void> {
    const persistenceData = WorkoutPlanMapper.toPersistence(workoutPlan);
    await this.workoutPlanModel.upsert(persistenceData);
  }

  public async findById(id: string): Promise<WorkoutPlan | null> {
    const model = await this.workoutPlanModel.findByPk(id);
    if (!model) {
      return null;
    }
    return WorkoutPlanMapper.toDomain(model);
  }

  public async findByAthleteId(athleteId: string): Promise<WorkoutPlan[]> {
    const models = await this.workoutPlanModel.findAll({
      where: { athleteId },
      order: [['createdAt', 'DESC']],
    });

    return models.map((model) => WorkoutPlanMapper.toDomain(model));
  }

  public async findActiveByAthleteId(
    athleteId: string,
  ): Promise<WorkoutPlan | null> {
    const model = await this.workoutPlanModel.findOne({
      where: {
        athleteId,
        isActive: true,
      },
      order: [['createdAt', 'DESC']],
    });

    if (!model) {
      return null;
    }

    return WorkoutPlanMapper.toDomain(model);
  }

  public async delete(id: string): Promise<void> {
    await this.workoutPlanModel.destroy({
      where: { id },
    });
  }
}

