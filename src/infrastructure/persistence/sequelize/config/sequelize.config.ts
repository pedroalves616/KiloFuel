import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { AthleteModel } from '../models/athlete.model';
import { DietPlanModel } from '../models/diet-plan.model';
import { WorkoutPlanModel } from '../models/workout-plan.model';

export const buildSequelizeConfig = (
  configService: ConfigService,
): SequelizeModuleOptions => {
  const synchronize =
    configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true';

  const password =
    configService.get<string>('DB_PASS') ??
    configService.get<string>('DB_PASSWORD', 'postgres');

  return {
    dialect: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: Number(configService.get<number>('DB_PORT', 5433)),
    username: configService.get<string>('DB_USER', 'postgres'),
    password,
    database: configService.get<string>('DB_NAME', 'kilofuel_db'),
    models: [WorkoutPlanModel, AthleteModel, DietPlanModel],
    autoLoadModels: true,
    synchronize,
    logging: false,
  };
};
