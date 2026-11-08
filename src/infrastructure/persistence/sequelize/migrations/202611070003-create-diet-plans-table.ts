import { DataTypes, QueryInterface } from 'sequelize';
import { MigrationDefinition } from './202611020001-create-workout-plans-table';

export const CreateDietPlansTable202611070003: MigrationDefinition = {
  name: '202611070003-create-diet-plans-table',

  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_workout_plans_goal" ADD VALUE IF NOT EXISTS 'WEIGHT_LOSS';
    `);

    await queryInterface.createTable('diet_plans', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      athlete_id: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(160),
        allowNull: false,
      },
      goal: {
        type: DataTypes.ENUM(
          'BULKING',
          'CUTTING',
          'MAINTENANCE',
          'RECOMPOSITION',
        ),
        allowNull: false,
      },
      target_proteins_grams: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      target_carbs_grams: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      target_fats_grams: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      meals: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.addIndex('diet_plans', ['athlete_id'], {
      name: 'idx_diet_plans_athlete_id',
    });

    await queryInterface.addIndex('diet_plans', ['is_active'], {
      name: 'idx_diet_plans_is_active',
    });
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('diet_plans');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_diet_plans_goal";',
    );
  },
};

