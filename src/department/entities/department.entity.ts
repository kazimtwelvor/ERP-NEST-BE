import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { DepartmentStatus } from './department-status.entity';

@Entity('departments')
export class Department {
  @ApiProperty({ description: 'Department unique identifier (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Department name', example: 'Stitching' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Department code (unique identifier)', example: 'STCH' })
  @Column({ unique: true, name: 'code' })
  code: string;

  @ApiPropertyOptional({ description: 'Department description', example: 'Handles all stitching operations' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiPropertyOptional({
    description: 'Department status',
    enum: ['active', 'inactive'],
    default: 'active',
    example: 'active',
  })
  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  @ApiPropertyOptional({ description: 'Department manager', type: () => User })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: User | null;

  @OneToMany(() => User, (user) => user.department)
  users: User[];

  @ApiPropertyOptional({
    description: 'Department statuses that can be used for order items',
    type: () => DepartmentStatus,
    isArray: true,
  })
  @OneToMany(() => DepartmentStatus, (departmentStatus) => departmentStatus.department)
  statuses: DepartmentStatus[];

  @ApiProperty({ description: 'Department creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
