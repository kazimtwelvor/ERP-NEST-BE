import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @ApiProperty({ description: 'User unique identifier (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User email address', example: 'john.doe@example.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'User password (hashed)', writeOnly: true })
  @Column()
  @Exclude()
  password: string;

  @ApiProperty({ description: 'User first name', example: 'John' })
  @Column({ name: 'first_name' })
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  @Column({ name: 'last_name' })
  lastName: string;

  @ApiPropertyOptional({ description: 'User phone number', example: '+1234567890' })
  @Column({ nullable: true })
  phone: string;

  @ApiPropertyOptional({ description: 'User address', example: '123 Main Street' })
  @Column({ nullable: true })
  address: string;

  @ApiPropertyOptional({ description: 'User city', example: 'New York' })
  @Column({ nullable: true })
  city: string;

  @ApiPropertyOptional({ description: 'User state', example: 'NY' })
  @Column({ nullable: true })
  state: string;

  @ApiPropertyOptional({ description: 'User postal code', example: '10001' })
  @Column({ nullable: true, name: 'postal_code' })
  postalCode: string;

  @ApiPropertyOptional({ description: 'User country', example: 'USA' })
  @Column({ nullable: true })
  country: string;

  @ApiPropertyOptional({
    description: 'User status',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    example: 'active',
  })
  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'User role',
    enum: ['admin', 'manager', 'employee', 'customer'],
    default: 'employee',
    example: 'employee',
  })
  @Column({
    type: 'enum',
    enum: ['admin', 'manager', 'employee', 'customer'],
    default: 'employee',
  })
  role: string;

  @ApiPropertyOptional({ description: 'Last login timestamp' })
  @Column({ name: 'last_login', nullable: true })
  lastLogin: Date;

  @ApiPropertyOptional({ description: 'Email verification status', default: false })
  @Column({ default: false, name: 'is_email_verified' })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Account creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  async hashPasswordOnInsert() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
