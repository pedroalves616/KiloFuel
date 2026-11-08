import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersistenceModule } from './infrastructure/persistence/sequelize/persistence.module';
import { AuthModule } from './presentation/auth.module';
import { DietModule } from './presentation/diet.module';
import { WorkoutModule } from './presentation/workout.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
    PersistenceModule,
    AuthModule,
    WorkoutModule,
    DietModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
