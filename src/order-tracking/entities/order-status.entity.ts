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
import { Role } from '../../role-permission/entities/role.entity';
import { DepartmentStatus as DepartmentStatusEnum } from '../enums/department-status.enum';

@Entity('order_statuses')
@Unique(['roleId', 'status'])
@Index(['roleId', 'status'])
export class OrderStatus {
  @ApiProperty({ description: 'Order status unique identifier (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ 
    description: 'Role reference',
    type: () => Role,
  })
  @ManyToOne(() => Role, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'role_id' })
  roleId: string;

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
    description: 'Whether this status is active for the role',
    default: true,
  })
  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive: boolean;

  @ApiProperty({ description: 'Order status creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}


