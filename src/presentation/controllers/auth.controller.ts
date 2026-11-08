import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  AthleteProfileOutputDto,
  AuthOutputDto,
} from '../../core/application/dtos/auth.dto';
import { AuthenticateAthleteUseCase } from '../../core/application/use-cases/authenticate-athlete.use-case';
import { GetAuthenticatedAthleteProfileUseCase } from '../../core/application/use-cases/get-authenticated-athlete-profile.use-case';
import { RefreshAuthTokenUseCase } from '../../core/application/use-cases/refresh-auth-token.use-case';
import { RegisterAthleteUseCase } from '../../core/application/use-cases/register-athlete.use-case';
import { TokenPayload } from '../../core/domain/ports/token-service.port';
import { CurrentAthlete } from '../decorators/current-athlete.decorator';
import {
  LoginHttpDto,
  RefreshTokenHttpDto,
  RegisterAthleteHttpDto,
} from '../dtos/auth-http.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerAthleteUseCase: RegisterAthleteUseCase,
    private readonly authenticateAthleteUseCase: AuthenticateAthleteUseCase,
    private readonly refreshAuthTokenUseCase: RefreshAuthTokenUseCase,
    private readonly getAuthenticatedAthleteProfileUseCase: GetAuthenticatedAthleteProfileUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async register(
    @Body() body: RegisterAthleteHttpDto,
  ): Promise<AuthOutputDto> {
    return this.registerAthleteUseCase.execute({
      name: body.name,
      email: body.email,
      password: body.password,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() body: LoginHttpDto): Promise<AuthOutputDto> {
    return this.authenticateAthleteUseCase.execute({
      email: body.email,
      password: body.password,
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async refresh(
    @Body() body: RefreshTokenHttpDto,
  ): Promise<AuthOutputDto> {
    return this.refreshAuthTokenUseCase.execute({
      refreshToken: body.refreshToken,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  public async getProfile(
    @CurrentAthlete() athlete: TokenPayload,
  ): Promise<AthleteProfileOutputDto> {
    return this.getAuthenticatedAthleteProfileUseCase.execute(athlete.sub);
  }
}

