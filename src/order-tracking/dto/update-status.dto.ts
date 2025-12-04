import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum OrderItemStatus {
  PENDING = 'pending',
  CHECKED_IN = 'checked-in',
  IN_PROGRESS = 'in-progress',
  CHECKED_OUT = 'checked-out',
  COMPLETED = 'completed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
}

export enum PreparationType {
  IN_HOUSE = 'in-house',
  OUTSOURCED = 'outsourced',
}

export class UpdateStatusDto {
  @ApiProperty({
    description: 'QR code of the order item',
    example: 'ORDER_ITEM_UUID_HASH',
  })
  @IsString()
  @IsNotEmpty({ message: 'QR code is required' })
  qrCode: string;

  @ApiProperty({
    description: 'New status',
    enum: OrderItemStatus,
    example: 'in-progress',
  })
  @IsEnum(OrderItemStatus, { message: 'Invalid status value' })
  @IsNotEmpty({ message: 'Status is required' })
  status: OrderItemStatus;

  @ApiProperty({
    description: 'Department ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Department ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Department ID is required' })
  departmentId: string;

  @ApiProperty({
    description: 'Password for authentication',
    example: 'securePassword123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiProperty({
    description: 'User ID performing the action',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @ApiPropertyOptional({
    description: 'Preparation type (in-house or outsourced)',
    enum: PreparationType,
    example: 'in-house',
  })
  @IsEnum(PreparationType, { message: 'Invalid preparation type' })
  @IsOptional()
  preparationType?: PreparationType;

  @ApiPropertyOptional({
    description: 'Order status (e.g., cutting_in_progress, cutting_pending_approval)',
    example: 'cutting_in_progress',
  })
  @IsString()
  @IsOptional()
  orderStatus?: string;

  @ApiPropertyOptional({
    description: 'Optional notes for the status update',
    example: 'Processing started',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

