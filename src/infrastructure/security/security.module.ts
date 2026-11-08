import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PASSWORD_HASHER_PORT } from '../../core/domain/ports/password-hasher.port';
import { TOKEN_SERVICE_PORT } from '../../core/domain/ports/token-service.port';
import { JwtTokenService } from './jwt-token.service';
import { ScryptPasswordHasher } from './scrypt-password.hasher';

@Module({
  imports: [ConfigModule],
  providers: [
    ScryptPasswordHasher,
    JwtTokenService,
    {
      provide: PASSWORD_HASHER_PORT,
      useExisting: ScryptPasswordHasher,
    },
    {
      provide: TOKEN_SERVICE_PORT,
      useExisting: JwtTokenService,
    },
  ],
  exports: [PASSWORD_HASHER_PORT, TOKEN_SERVICE_PORT],
})
export class SecurityModule {}

