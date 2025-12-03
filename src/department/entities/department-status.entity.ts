import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Department } from './department.entity';
import { DepartmentStatus as DepartmentStatusEnum } from '../../order-tracking/enums/department-status.enum';

@Entity('department_statuses')
@Unique(['departmentId', 'status'])
@Index(['departmentId', 'status'])
export class DepartmentStatus {
  @ApiProperty({ description: 'Department status unique identifier (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ 
    description: 'Department reference',
    type: () => Department,
  })
  @ManyToOne(() => Department, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ name: 'department_id' })
  departmentId: string;

  @ApiProperty({
    description: 'Status value from DepartmentStatus enum',
    enum: DepartmentStatusEnum,
    example: DepartmentStatusEnum.CUTTING_IN_PROGRESS,
  })
  @Column({
    type: 'varchar',
    name: 'status',
  })
  status: string;

  @ApiProperty({
    description: 'Display order for sorting statuses',
    default: 0,
  })
  @Column({
    type: 'int',
    default: 0,
    name: 'display_order',
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Whether this status is active for the department',
    default: true,
  })
  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive: boolean;

  @ApiProperty({ description: 'Department status creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

