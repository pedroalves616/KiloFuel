import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
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
    port: Number(configService.get<number>('DB_PORT', 5432)),
    username: configService.get<string>('DB_USER', 'postgres'),
    password,
    database: configService.get<string>('DB_NAME', 'fitpulse_db'),
    models: [WorkoutPlanModel],
    autoLoadModels: true,
    synchronize,
    logging: false,
  };
};
