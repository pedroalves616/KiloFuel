import * as fs from 'fs';
import * as path from 'path';
import { DataTypes, QueryTypes, Sequelize } from 'sequelize';
import {
  CreateWorkoutPlansTable202611020001,
  MigrationDefinition,
} from './202611020001-create-workout-plans-table';
import { CreateAthletesTable202611070002 } from './202611070002-create-athletes-table';
import { CreateDietPlansTable202611070003 } from './202611070003-create-diet-plans-table';

function loadEnvFile(): void {
  const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.example'),
  ];

  for (const envPath of envPaths) {
    if (!fs.existsSync(envPath)) continue;
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

const migrations: MigrationDefinition[] = [
  CreateWorkoutPlansTable202611020001,
  CreateAthletesTable202611070002,
  CreateDietPlansTable202611070003,
];

async function ensureMetaTable(sequelize: Sequelize): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.createTable(
    'SequelizeMeta',
    {
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      ifNotExists: true,
    } as Record<string, unknown>,
  );
}

async function getExecutedMigrations(sequelize: Sequelize): Promise<Set<string>> {
  const rows = await sequelize.query<{ name: string }>(
    'SELECT name FROM "SequelizeMeta" ORDER BY name ASC;',
    { type: QueryTypes.SELECT },
  );
  return new Set(rows.map((r) => r.name));
}

async function run(): Promise<void> {
  loadEnvFile();

  const direction = process.argv[2] ?? 'up';
  const host = process.env.DB_HOST ?? 'localhost';
  const port = Number(process.env.DB_PORT ?? 5432);
  const username = process.env.DB_USER ?? 'postgres';
  const password = process.env.DB_PASS ?? process.env.DB_PASSWORD ?? 'postgres';
  const database = process.env.DB_NAME ?? 'kilofuel_db';

  const sequelize = new Sequelize({
    dialect: 'postgres',
    host,
    port,
    username,
    password,
    database,
    logging: false,
  });

  try {
    await sequelize.authenticate();
    await ensureMetaTable(sequelize);
    const executed = await getExecutedMigrations(sequelize);
    const queryInterface = sequelize.getQueryInterface();

    if (direction === 'up') {
      for (const migration of migrations) {
        if (executed.has(migration.name)) {
          console.log(`[SKIP] Migration already applied: ${migration.name}`);
          continue;
        }
        console.log(`[UP] Applying migration: ${migration.name}...`);
        await migration.up(queryInterface);
        await sequelize.query(
          'INSERT INTO "SequelizeMeta" (name) VALUES (:name);',
          { replacements: { name: migration.name } },
        );
        console.log(`[DONE] Applied migration: ${migration.name}`);
      }
    } else if (direction === 'down') {
      const reversed = [...migrations].reverse();
      for (const migration of reversed) {
        if (!executed.has(migration.name)) continue;
        console.log(`[DOWN] Reverting migration: ${migration.name}...`);
        await migration.down(queryInterface);
        await sequelize.query(
          'DELETE FROM "SequelizeMeta" WHERE name = :name;',
          { replacements: { name: migration.name } },
        );
        console.log(`[DONE] Reverted migration: ${migration.name}`);
        break;
      }
    } else if (direction === 'status') {
      for (const migration of migrations) {
        const status = executed.has(migration.name) ? 'APPLIED' : 'PENDING';
        console.log(`[${status}] ${migration.name}`);
      }
    } else {
      throw new Error(`Unknown migration command: ${direction}`);
    }
  } finally {
    await sequelize.close();
  }
}

run().catch((error: unknown) => {
  console.error('[MIGRATION ERROR]', error);
  process.exit(1);
});

