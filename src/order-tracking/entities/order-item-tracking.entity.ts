import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrderItem } from './order-item.entity';
import { Department } from '../../department/entities/department.entity';
import { User } from '../../user/entities/user.entity';

@Entity('order_item_tracking')
@Index(['orderItemId', 'createdAt'])
export class OrderItemTracking {
  @ApiProperty({ description: 'Tracking record unique identifier (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Order item reference' })
  @ManyToOne(() => OrderItem, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @Column({ name: 'order_item_id' })
  orderItemId: string;

  @ApiProperty({ description: 'Department reference' })
  @ManyToOne(() => Department, { nullable: false })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ name: 'department_id' })
  departmentId: string;

  @ApiProperty({ description: 'User who performed the action' })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({ 
    description: 'Action type',
    enum: ['check-in', 'check-out', 'status-update'],
    example: 'check-in'
  })
  @Column({
    type: 'enum',
    enum: ['check-in', 'check-out', 'status-update'],
    name: 'action_type'
  })
  actionType: string;

  @ApiProperty({ 
    description: 'Status after action - can be currentStatus (pending, checked-in, in-progress, etc.) or orderStatus (cutting_in_progress, stitching_in_progress, etc.)',
    example: 'cutting_in_progress'
  })
  @Column({
    type: 'varchar',
    nullable: true,
    name: 'status'
  })
  status: string | null;

  @ApiProperty({ 
    description: 'Preparation type at time of action',
    enum: ['in-house', 'outsourced'],
    nullable: true
  })
  @Column({
    type: 'enum',
    enum: ['in-house', 'outsourced'],
    nullable: true,
    name: 'preparation_type'
  })
  preparationType: string | null;

  @ApiProperty({ 
    description: 'Order status at time of action',
    example: 'cutting_in_progress',
    nullable: true
  })
  @Column({
    type: 'varchar',
    nullable: true,
    name: 'department_status'
  })
  departmentStatus: string | null;

  @ApiProperty({ description: 'Previous status', nullable: true })
  @Column({ name: 'previous_status', type: 'varchar', nullable: true })
  previousStatus: string | null;

  @ApiProperty({ description: 'Notes or comments', nullable: true })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Timestamp when action was performed' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

