# KiloFuel API

Backend para prescrição de rotinas de treino e gestão de performance de atletas construído com **Clean Architecture**, **Domain-Driven Design (DDD)**, **NestJS**, **Sequelize (`sequelize-typescript`)** e **PostgreSQL 16**.

---

## Arquitetura do Projeto

O projeto respeita estritamente a **Regra de Dependência** da Clean Architecture:

- **`src/core/domain`**: Entidades ricas (`WorkoutPlan`), Value Objects imutáveis (`RpeScore`, `WorkoutExercise`), Ports (`WorkoutRepositoryPort`) e erros de domínio (`DomainError`). Zero dependências externas (`@nestjs/*` ou `sequelize`).
- **`src/core/application`**: Casos de Uso (`CreateWorkoutPlanUseCase`, `GetWorkoutPlanByIdUseCase`, `ListWorkoutsByAthleteUseCase`) e DTOs de entrada/saída.
- **`src/infrastructure/persistence/sequelize`**: Modelos Sequelize (`WorkoutPlanModel`), Data Mappers bidirecionais (`WorkoutPlanMapper`), repositórios concretos (`SequelizeWorkoutRepository`) e migrations declarativas.
- **`src/presentation`**: Controllers HTTP (`WorkoutController`), DTOs validados com `class-validator` (`CreateWorkoutPlanHttpDto`), `DomainExceptionFilter` global e módulo de injeção de dependências (`WorkoutModule`).

---

## Pré-requisitos

- **Node.js** v20+
- **Docker** & **Docker Compose**

---

## Passo a Passo de Execução Local

### 1. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Subir o banco de dados PostgreSQL via Docker

```bash
docker compose up -d postgres
```

Verifique a saúde do container:

```bash
docker exec kilofuel_postgres pg_isready -U postgres -d kilofuel_db
```

### 4. Executar as Migrations

```bash
npm run db:migrate
```

Outros comandos de migration disponíveis:
- `npm run db:migrate:status`: Lista o status das migrations aplicadas/pendentes.
- `npm run db:migrate:undo`: Reverte a última migration aplicada.

### 5. Iniciar a Aplicação

```bash
# Modo desenvolvimento (watch)
npm run start:dev

# Build e modo produção
npm run build
npm run start:prod
```

A API estará disponível em `http://localhost:3000`.

---

## Testando os Endpoints (cURL)

### 1. Criar um Plano de Treino (`POST /workouts`)

```bash
curl -X POST http://localhost:3000/workouts \
  -H "Content-Type: application/json" \
  -d '{
    "athleteId": "athlete-001",
    "name": "Upper / Lower Hipertrofia",
    "description": "Bloco de acumulação de volume",
    "goal": "HYPERTROPHY",
    "weeklyFrequency": 4,
    "exercises": [
      {
        "name": "Supino Reto com Barra",
        "muscleGroup": "CHEST",
        "sets": 4,
        "minReps": 6,
        "maxReps": 8,
        "targetRpe": 8.5,
        "restSeconds": 180,
        "notes": "Pausa de 1s no peito"
      },
      {
        "name": "Remada Curvada Pronada",
        "muscleGroup": "BACK",
        "sets": 4,
        "minReps": 8,
        "maxReps": 10,
        "targetRpe": 8,
        "restSeconds": 120
      }
    ]
  }'
```

### 2. Consultar Plano de Treino por ID (`GET /workouts/:id`)

```bash
curl http://localhost:3000/workouts/<WORKOUT_ID>
```

### 3. Listar Planos de Treino de um Atleta (`GET /workouts/user/:userId`)

```bash
# Todos os planos do atleta
curl http://localhost:3000/workouts/user/athlete-001

# Apenas o plano ativo do atleta
curl "http://localhost:3000/workouts/user/athlete-001?onlyActive=true"
```

---

## Executando os Testes Automatizados

```bash
# Testes unitários e de integração em memória
npm test

# Testes End-to-End (E2E) contra o PostgreSQL real
npm run test:e2e
```

