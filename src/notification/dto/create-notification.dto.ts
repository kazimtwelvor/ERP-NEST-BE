import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NOTIFICATION_MESSAGES } from '../messages/notification.messages';

export class CreateNotificationDto {
  @ApiProperty({ description: 'Notification title', example: 'New Order Assigned' })
  @IsString()
  @IsNotEmpty({ message: NOTIFICATION_MESSAGES.TITLE_REQUIRED })
  title: string;

  @ApiProperty({ description: 'Notification description', example: 'You have been assigned to order #12345' })
  @IsString()
  @IsNotEmpty({ message: NOTIFICATION_MESSAGES.DESCRIPTION_REQUIRED })
  description: string;

  @ApiProperty({ description: 'User ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  @IsNotEmpty({ message: NOTIFICATION_MESSAGES.USER_ID_REQUIRED })
  userId: string;
}
