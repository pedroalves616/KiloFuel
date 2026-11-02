import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainError } from '../../core/domain/errors/domain.error';
import { EntityNotFoundError } from '../../core/domain/errors/entity-not-found.error';
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

    if (
      exception instanceof InvalidRpeScoreError ||
      exception instanceof InvalidWorkoutPlanError
    ) {
      return HttpStatus.BAD_REQUEST;
    }

    return HttpStatus.UNPROCESSABLE_ENTITY;
  }
}

