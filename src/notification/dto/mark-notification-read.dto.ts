import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkNotificationReadDto {
  @ApiProperty({ description: 'User ID (UUID) who read the notification' })
  @IsUUID('4')
  @IsNotEmpty()
  userId: string;
}

