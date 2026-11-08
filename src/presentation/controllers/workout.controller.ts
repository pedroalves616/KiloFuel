import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { WorkoutPlanOutputDto } from '../../core/application/dtos/workout-plan-output.dto';
import { CreateWorkoutPlanUseCase } from '../../core/application/use-cases/create-workout-plan.use-case';
import { GetWorkoutPlanByIdUseCase } from '../../core/application/use-cases/get-workout-plan-by-id.use-case';
import { ListWorkoutsByAthleteUseCase } from '../../core/application/use-cases/list-workouts-by-athlete.use-case';
import { ToggleWorkoutPlanActiveUseCase } from '../../core/application/use-cases/toggle-workout-plan-active.use-case';
import { CreateWorkoutPlanHttpDto } from '../dtos/create-workout-plan-http.dto';

@Controller('workouts')
export class WorkoutController {
  constructor(
    private readonly createWorkoutPlanUseCase: CreateWorkoutPlanUseCase,
    private readonly getWorkoutPlanByIdUseCase: GetWorkoutPlanByIdUseCase,
    private readonly listWorkoutsByAthleteUseCase: ListWorkoutsByAthleteUseCase,
    private readonly toggleWorkoutPlanActiveUseCase: ToggleWorkoutPlanActiveUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() body: CreateWorkoutPlanHttpDto,
  ): Promise<WorkoutPlanOutputDto> {
    return this.createWorkoutPlanUseCase.execute({
      athleteId: body.athleteId,
      name: body.name,
      description: body.description,
      goal: body.goal,
      weeklyFrequency: body.weeklyFrequency,
      exercises: body.exercises,
      deactivateExistingPlans: body.deactivateExistingPlans,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  public async findById(
    @Param('id') id: string,
  ): Promise<WorkoutPlanOutputDto> {
    return this.getWorkoutPlanByIdUseCase.execute(id);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  public async findByUser(
    @Param('userId') userId: string,
    @Query('onlyActive') onlyActive?: string,
  ): Promise<WorkoutPlanOutputDto[]> {
    return this.listWorkoutsByAthleteUseCase.execute({
      athleteId: userId,
      onlyActive: onlyActive === 'true',
    });
  }

  @Patch(':id/toggle-active')
  @HttpCode(HttpStatus.OK)
  public async toggleActive(
    @Param('id') id: string,
  ): Promise<WorkoutPlanOutputDto> {
    return this.toggleWorkoutPlanActiveUseCase.execute(id);
  }
}

