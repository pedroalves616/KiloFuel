import { DataTypes, QueryInterface } from 'sequelize';
import { MigrationDefinition } from './202611020001-create-workout-plans-table';

export const CreateAthletesTable202611070002: MigrationDefinition = {
  name: '202611070002-create-athletes-table',

  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('athletes', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(254),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
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

    await queryInterface.addIndex('athletes', ['email'], {
      name: 'idx_athletes_email',
      unique: true,
    });

    await queryInterface.addIndex('athletes', ['is_active'], {
      name: 'idx_athletes_is_active',
    });
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('athletes');
  },
};

