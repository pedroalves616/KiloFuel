import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersistenceModule } from './infrastructure/persistence/sequelize/persistence.module';
import { WorkoutModule } from './presentation/workout.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
    PersistenceModule,
    WorkoutModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
