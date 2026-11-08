import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AthleteAlreadyExistsError } from '../../core/domain/errors/athlete-already-exists.error';
import { DomainError } from '../../core/domain/errors/domain.error';
import { EntityNotFoundError } from '../../core/domain/errors/entity-not-found.error';
import { InvalidAthleteError } from '../../core/domain/errors/invalid-athlete.error';
import { InvalidCredentialsError } from '../../core/domain/errors/invalid-credentials.error';
import { InvalidDietPlanError } from '../../core/domain/errors/invalid-diet-plan.error';
import { InvalidEmailError } from '../../core/domain/errors/invalid-email.error';
import { InvalidMacroDistributionError } from '../../core/domain/errors/invalid-macro-distribution.error';
import { InvalidRpeScoreError } from '../../core/domain/errors/invalid-rpe-score.error';
import { InvalidWorkoutPlanError } from '../../core/domain/errors/invalid-workout-plan.error';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  public catch(exception: DomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.resolveHttpStatus(exception);

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      code: exception.code,
      message: exception.message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private resolveHttpStatus(exception: DomainError): HttpStatus {
    if (exception instanceof EntityNotFoundError) {
      return HttpStatus.NOT_FOUND;
    }

    if (exception instanceof InvalidCredentialsError) {
      return HttpStatus.UNAUTHORIZED;
    }

    if (exception instanceof AthleteAlreadyExistsError) {
      return HttpStatus.CONFLICT;
    }

    if (
      exception instanceof InvalidRpeScoreError ||
      exception instanceof InvalidWorkoutPlanError ||
      exception instanceof InvalidEmailError ||
      exception instanceof InvalidAthleteError ||
      exception instanceof InvalidDietPlanError ||
      exception instanceof InvalidMacroDistributionError
    ) {
      return HttpStatus.BAD_REQUEST;
    }

    return HttpStatus.UNPROCESSABLE_ENTITY;
  }
}
