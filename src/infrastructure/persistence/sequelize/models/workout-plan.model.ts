import {
  Column,
  CreatedAt,
  DataType,
  Index,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { WorkoutGoal } from '../../../../core/domain/entities/workout-plan.entity';
import { CreateWorkoutExercisePrimitives } from '../../../../core/domain/value-objects/workout-exercise.vo';

export interface WorkoutPlanPersistenceAttributes {
  id: string;
  athleteId: string;
  name: string;
  description: string | null;
  goal: WorkoutGoal;
  weeklyFrequency: number;
  exercises: CreateWorkoutExercisePrimitives[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Table({
  tableName: 'workout_plans',
  timestamps: true,
  underscored: true,
})
export class WorkoutPlanModel extends Model<
  WorkoutPlanPersistenceAttributes,
  WorkoutPlanPersistenceAttributes
> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare id: string;

  @Index('idx_workout_plans_athlete_id')
  @Column({
    field: 'athlete_id',
    type: DataType.STRING(128),
    allowNull: false,
  })
  declare athleteId: string;

  @Column({
    type: DataType.STRING(160),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  @Column({
    type: DataType.ENUM(
      'HYPERTROPHY',
      'STRENGTH',
      'ENDURANCE',
      'FAT_LOSS',
      'WEIGHT_LOSS',
      'GENERAL_FITNESS',
    ),
    allowNull: false,
  })
  declare goal: WorkoutGoal;

  @Column({
    field: 'weekly_frequency',
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare weeklyFrequency: number;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: [],
  })
  declare exercises: CreateWorkoutExercisePrimitives[];

  @Index('idx_workout_plans_is_active')
  @Column({
    field: 'is_active',
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: boolean;

  @CreatedAt
  @Column({
    field: 'created_at',
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    field: 'updated_at',
    type: DataType.DATE,
    allowNull: false,
  })
  declare updatedAt: Date;
}

