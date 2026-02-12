import { ArrayNotEmpty, IsArray, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkMarkNotificationReadDto {
  @ApiProperty({ description: 'User ID (UUID) who read the notifications' })
  @IsUUID('4')
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Notification IDs (UUIDs) to mark as read', isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  notificationIds: string[];
}

