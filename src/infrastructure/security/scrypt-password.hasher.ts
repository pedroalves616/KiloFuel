import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { PasswordHasherPort } from '../../core/domain/ports/password-hasher.port';

const scryptAsync = promisify(scryptCallback);

@Injectable()
export class ScryptPasswordHasher implements PasswordHasherPort {
  private static readonly SALT_BYTES = 16;
  private static readonly KEY_LENGTH = 64;

  public async hash(plainPassword: string): Promise<string> {
    const salt = randomBytes(ScryptPasswordHasher.SALT_BYTES).toString('hex');
    const derivedKey = (await scryptAsync(
      plainPassword,
      salt,
      ScryptPasswordHasher.KEY_LENGTH,
    )) as Buffer;

    return `${salt}:${derivedKey.toString('hex')}`;
  }

  public async compare(
    plainPassword: string,
    passwordHash: string,
  ): Promise<boolean> {
    const parts = passwordHash.split(':');
    if (parts.length !== 2) {
      return false;
    }

    const [salt, storedHashHex] = parts;
    if (!salt || !storedHashHex) {
      return false;
    }

    const storedKeyBuffer = Buffer.from(storedHashHex, 'hex');
    const derivedKey = (await scryptAsync(
      plainPassword,
      salt,
      ScryptPasswordHasher.KEY_LENGTH,
    )) as Buffer;

    if (storedKeyBuffer.length !== derivedKey.length) {
      return false;
    }

    return timingSafeEqual(storedKeyBuffer, derivedKey);
  }
}
