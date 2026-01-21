import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PatchOrder } from './patch-order.entity';
import { Department } from '../../department/entities/department.entity';
import { User } from '../../user/entities/user.entity';

@Entity('patch_order_tracking')
export class PatchOrderTracking {
  @ApiProperty({ description: 'Tracking record ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Patch order ID' })
  @Column({ name: 'patch_order_id', type: 'uuid' })
  patchOrderId: string;

  @ApiProperty({ description: 'Department ID' })
  @Column({ name: 'department_id', type: 'uuid' })
  departmentId: string;

  @ApiProperty({ description: 'User ID' })
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;


  @ApiProperty({ description: 'Current status' })
  @Column({ type: 'varchar' })
  status: string;

  @ApiProperty({ description: 'Previous status', nullable: true })
  @Column({ name: 'previous_status', type: 'varchar', nullable: true })
  previousStatus: string | null;

  @ApiProperty({ description: 'Notes', nullable: true })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({ description: 'Timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => PatchOrder)
  @JoinColumn({ name: 'patch_order_id' })
  patchOrder: PatchOrder;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
