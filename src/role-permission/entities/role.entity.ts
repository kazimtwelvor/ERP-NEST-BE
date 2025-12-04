import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Permission } from './permission.entity';
import { User } from '../../user/entities/user.entity';
import { OrderStatus } from '../../order-tracking/entities/order-status.entity';

@Entity('roles')
export class Role {
  @ApiProperty({ description: 'Role unique identifier (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Role name (unique)', example: 'admin' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Role display name', example: 'Administrator' })
  @Column({ name: 'display_name' })
  displayName: string;

  @ApiPropertyOptional({ description: 'Role description', example: 'Full system access' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiPropertyOptional({
    description: 'Role status',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  @ApiPropertyOptional({ description: 'Is this a system role (cannot be deleted)', default: false })
  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @ManyToMany(() => Permission, (permission) => permission.roles, { cascade: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @ApiPropertyOptional({
    description: 'Order statuses that can be used by this role',
    type: () => OrderStatus,
    isArray: true,
  })
  @OneToMany(() => OrderStatus, (orderStatus) => orderStatus.role)
  orderStatuses: OrderStatus[];

  @ApiProperty({ description: 'Role creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

