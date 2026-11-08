import {
  Column,
  CreatedAt,
  DataType,
  Index,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';

export interface AthletePersistenceAttributes {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Table({
  tableName: 'athletes',
  timestamps: true,
  underscored: true,
})
export class AthleteModel extends Model<
  AthletePersistenceAttributes,
  AthletePersistenceAttributes
> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(120),
    allowNull: false,
  })
  declare name: string;

  @Unique('uq_athletes_email')
  @Index('idx_athletes_email')
  @Column({
    type: DataType.STRING(254),
    allowNull: false,
  })
  declare email: string;

  @Column({
    field: 'password_hash',
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare passwordHash: string;

  @Index('idx_athletes_is_active')
  @Column({
    field: 'is_active',
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: boolean;

  @CreatedAt
  @Column({
    field: 'created_at',
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    field: 'updated_at',
    type: DataType.DATE,
    allowNull: false,
  })
  declare updatedAt: Date;
}

