import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { DietGoal } from '../../core/domain/entities/diet-plan.entity';

const DIET_GOALS: DietGoal[] = [
  'BULKING',
  'CUTTING',
  'MAINTENANCE',
  'RECOMPOSITION',
];

export class CreateMealHttpDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;

  @IsString()
  @IsNotEmpty()
  time!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  proteinsGrams!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  carbsGrams!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fatsGrams!: number;
}

export class CreateDietPlanHttpDto {
  @IsString()
  @IsNotEmpty()
  athleteId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @IsString()
  @IsIn(DIET_GOALS)
  goal!: DietGoal;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  targetProteinsGrams!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  targetCarbsGrams!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  targetFatsGrams!: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealHttpDto)
  meals?: CreateMealHttpDto[];

  @IsOptional()
  @IsBoolean()
  deactivateExistingPlans?: boolean;
}

