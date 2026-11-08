import { InvalidAthleteError } from '../errors/invalid-athlete.error';
import { Email } from '../value-objects/email.vo';

export interface CreateAthleteProps {
  id?: string;
  name: string;
  email: Email;
  passwordHash: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReconstituteAthleteProps {
  id: string;
  name: string;
  email: Email;
  passwordHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Athlete {
  private readonly _id: string;
  private _name: string;
  private _email: Email;
  private _passwordHash: string;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ReconstituteAthleteProps) {
    this._id = props.id;
    this._name = props.name;
    this._email = props.email;
    this._passwordHash = props.passwordHash;
    this._isActive = props.isActive;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(props: CreateAthleteProps): Athlete {
    const now = new Date();
    const id = props.id?.trim() || crypto.randomUUID();

    Athlete.validateInvariants({
      name: props.name,
      email: props.email,
      passwordHash: props.passwordHash,
    });

    return new Athlete({
      id,
      name: props.name.trim(),
      email: props.email,
      passwordHash: props.passwordHash,
      isActive: props.isActive ?? true,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  public static reconstitute(props: ReconstituteAthleteProps): Athlete {
    if (!props.id || props.id.trim().length === 0) {
      throw new InvalidAthleteError(
        'O ID do atleta é obrigatório na reconstituição.',
      );
    }

    Athlete.validateInvariants({
      name: props.name,
      email: props.email,
      passwordHash: props.passwordHash,
    });

    return new Athlete(props);
  }

  private static validateInvariants(params: {
    name: string;
    email: Email;
    passwordHash: string;
  }): void {
    if (!params.name || params.name.trim().length < 2) {
      throw new InvalidAthleteError(
        'O nome do atleta deve possuir pelo menos 2 caracteres.',
      );
    }

    if (params.name.trim().length > 120) {
      throw new InvalidAthleteError(
        'O nome do atleta deve possuir no máximo 120 caracteres.',
      );
    }

    if (!params.email) {
      throw new InvalidAthleteError('O e-mail do atleta é obrigatório.');
    }

    if (!params.passwordHash || params.passwordHash.trim().length === 0) {
      throw new InvalidAthleteError(
        'O hash de senha do atleta é obrigatório.',
      );
    }
  }

  public updateName(newName: string): Athlete {
    if (!newName || newName.trim().length < 2 || newName.trim().length > 120) {
      throw new InvalidAthleteError(
        'O nome do atleta deve possuir entre 2 e 120 caracteres.',
      );
    }
    this._name = newName.trim();
    this.touch();
    return this;
  }

  public deactivate(): Athlete {
    this._isActive = false;
    this.touch();
    return this;
  }

  public activate(): Athlete {
    this._isActive = true;
    this.touch();
    return this;
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get email(): Email {
    return this._email;
  }

  public get passwordHash(): string {
    return this._passwordHash;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}

