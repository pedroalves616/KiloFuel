import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { WorkoutGoal } from '../../core/domain/entities/workout-plan.entity';

const WORKOUT_GOALS: WorkoutGoal[] = [
  'HYPERTROPHY',
  'STRENGTH',
  'ENDURANCE',
  'FAT_LOSS',
  'WEIGHT_LOSS',
  'GENERAL_FITNESS',
];

export class CreateWorkoutExerciseHttpDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  muscleGroup!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  sets!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  minReps!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  maxReps!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  targetRpe!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(900)
  restSeconds!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateWorkoutPlanHttpDto {
  @IsString()
  @IsNotEmpty()
  athleteId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsIn(WORKOUT_GOALS)
  goal!: WorkoutGoal;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  weeklyFrequency!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutExerciseHttpDto)
  exercises!: CreateWorkoutExerciseHttpDto[];

  @IsOptional()
  @IsBoolean()
  deactivateExistingPlans?: boolean;
}

