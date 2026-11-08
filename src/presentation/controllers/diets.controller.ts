import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { DietPlanOutputDto } from '../../core/application/dtos/calculate-diet-input.dto';
import { CalculateDietPlanUseCase } from '../../core/application/use-cases/calculate-diet-plan.use-case';
import {
  GetDietPlanByIdUseCase,
  ListDietsByAthleteUseCase,
} from '../../core/application/use-cases/list-diets-by-athlete.use-case';
import { LogDailyMealConsumptionUseCase } from '../../core/application/use-cases/log-daily-meal-consumption.use-case';
import {
  CreateDietPlanHttpDto,
  CreateMealHttpDto,
} from '../dtos/diet-http.dto';

@Controller('diets')
export class DietsController {
  constructor(
    private readonly calculateDietPlanUseCase: CalculateDietPlanUseCase,
    private readonly listDietsByAthleteUseCase: ListDietsByAthleteUseCase,
    private readonly getDietPlanByIdUseCase: GetDietPlanByIdUseCase,
    private readonly logDailyMealConsumptionUseCase: LogDailyMealConsumptionUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() body: CreateDietPlanHttpDto,
  ): Promise<DietPlanOutputDto> {
    return this.calculateDietPlanUseCase.execute({
      athleteId: body.athleteId,
      name: body.name,
      goal: body.goal,
      targetProteinsGrams: body.targetProteinsGrams,
      targetCarbsGrams: body.targetCarbsGrams,
      targetFatsGrams: body.targetFatsGrams,
      meals: body.meals,
      deactivateExistingPlans: body.deactivateExistingPlans,
    });
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  public async findByUser(
    @Param('userId') userId: string,
    @Query('onlyActive') onlyActive?: string,
  ): Promise<DietPlanOutputDto[]> {
    return this.listDietsByAthleteUseCase.execute({
      athleteId: userId,
      onlyActive: onlyActive === 'true',
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  public async findById(@Param('id') id: string): Promise<DietPlanOutputDto> {
    return this.getDietPlanByIdUseCase.execute(id);
  }

  @Post(':id/meals')
  @HttpCode(HttpStatus.CREATED)
  public async addMeal(
    @Param('id') id: string,
    @Body() body: CreateMealHttpDto,
  ): Promise<DietPlanOutputDto> {
    return this.logDailyMealConsumptionUseCase.execute(id, {
      name: body.name,
      time: body.time,
      proteinsGrams: body.proteinsGrams,
      carbsGrams: body.carbsGrams,
      fatsGrams: body.fatsGrams,
    });
  }
}

