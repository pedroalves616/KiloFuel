import { DataTypes, QueryInterface } from 'sequelize';

export interface MigrationDefinition {
  name: string;
  up(queryInterface: QueryInterface): Promise<void>;
  down(queryInterface: QueryInterface): Promise<void>;
}

export const CreateWorkoutPlansTable202611020001: MigrationDefinition = {
  name: '202611020001-create-workout-plans-table',

  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('workout_plans', {
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      goal: {
        type: DataTypes.ENUM(
          'HYPERTROPHY',
          'STRENGTH',
          'ENDURANCE',
          'FAT_LOSS',
          'GENERAL_FITNESS',
        ),
        allowNull: false,
      },
      weekly_frequency: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      exercises: {
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

    await queryInterface.addIndex('workout_plans', ['athlete_id'], {
      name: 'idx_workout_plans_athlete_id',
    });

    await queryInterface.addIndex('workout_plans', ['is_active'], {
      name: 'idx_workout_plans_is_active',
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE workout_plans
      ADD CONSTRAINT chk_workout_plans_weekly_frequency
      CHECK (weekly_frequency >= 1 AND weekly_frequency <= 7);
    `);
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('workout_plans');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_workout_plans_goal";',
    );
  },
};

