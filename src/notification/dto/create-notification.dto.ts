import { IsString, IsNotEmpty, IsUUID, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { NOTIFICATION_MESSAGES } from '../messages/notification.messages';

class RoleInfoDto {
  @IsUUID('4')
  roleId: string;

  @IsString()
  roleName: string;
}

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

  @ApiPropertyOptional({ description: 'Role information', example: [{ roleId: '123e4567-e89b-12d3-a456-426614174000', roleName: 'Admin' }] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleInfoDto)
  roleInfo?: RoleInfoDto[];
}
