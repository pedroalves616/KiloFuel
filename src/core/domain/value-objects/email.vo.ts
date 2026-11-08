import { InvalidEmailError } from '../errors/invalid-email.error';

export class Email {
  private static readonly EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    Object.freeze(this);
  }

  public static create(rawEmail: string): Email {
    if (typeof rawEmail !== 'string') {
      throw new InvalidEmailError(String(rawEmail));
    }

    const normalized = rawEmail.trim().toLowerCase();
    if (!Email.isValid(normalized)) {
      throw new InvalidEmailError(rawEmail);
    }

    return new Email(normalized);
  }

  public static isValid(email: string): boolean {
    if (!email || email.length < 5 || email.length > 254) {
      return false;
    }
    return Email.EMAIL_REGEX.test(email);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: Email): boolean {
    if (!other) return false;
    return this._value === other._value;
  }
}

