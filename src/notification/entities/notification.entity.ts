import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

@Entity('notifications')
export class Notification {
  @ApiProperty({ description: 'Notification unique identifier (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Notification title', example: 'New Order Assigned' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Notification description', example: 'You have been assigned to order #12345' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Read status', default: false })
  @Column({ default: false, name: 'is_read' })
  isRead: boolean;

  @ApiProperty({ description: 'User who performs the action notification', type: () => User })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: 'Notification creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
