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
import { DietGoal } from '../../../../core/domain/entities/diet-plan.entity';
import { MealItemPrimitives } from '../../../../core/domain/value-objects/meal-item.vo';

export interface DietPlanPersistenceAttributes {
  id: string;
  athleteId: string;
  name: string;
  goal: DietGoal;
  targetProteinsGrams: number;
  targetCarbsGrams: number;
  targetFatsGrams: number;
  meals: MealItemPrimitives[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Table({
  tableName: 'diet_plans',
  timestamps: true,
  underscored: true,
})
export class DietPlanModel extends Model<
  DietPlanPersistenceAttributes,
  DietPlanPersistenceAttributes
> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare id: string;

  @Index('idx_diet_plans_athlete_id')
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
    type: DataType.ENUM('BULKING', 'CUTTING', 'MAINTENANCE', 'RECOMPOSITION'),
    allowNull: false,
  })
  declare goal: DietGoal;

  @Column({
    field: 'target_proteins_grams',
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare targetProteinsGrams: number;

  @Column({
    field: 'target_carbs_grams',
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare targetCarbsGrams: number;

  @Column({
    field: 'target_fats_grams',
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare targetFatsGrams: number;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: [],
  })
  declare meals: MealItemPrimitives[];

  @Index('idx_diet_plans_is_active')
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

