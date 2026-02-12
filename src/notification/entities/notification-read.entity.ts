import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Notification } from './notification.entity';
import { User } from '../../user/entities/user.entity';

@Entity('notification_reads')
@Index(['notification', 'user'], { unique: true })
export class NotificationRead {
  @ApiProperty({ description: 'Notification read unique identifier (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Notification' })
  @ManyToOne(() => Notification, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notification_id' })
  notification: Notification;

  @ApiProperty({ description: 'User who read the notification' })
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: 'Read timestamp' })
  @Column({ type: 'timestamp', name: 'read_at' })
  readAt: Date;
}
