import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DepartmentStatus } from '../enums/department-status.enum';

export class ReturnToStageDto {
  @ApiProperty({
    description: 'QR code of the order item',
    example: 'ORDER_ITEM_UUID_HASH',
  })
  @IsString()
  @IsNotEmpty({ message: 'QR code is required' })
  qrCode: string;

  @ApiProperty({
    description: 'Order status to return to',
    enum: DepartmentStatus,
    example: 'cutting_in_progress',
  })
  @IsEnum(DepartmentStatus, { message: 'Invalid order status' })
  @IsNotEmpty({ message: 'Order status is required' })
  returnToStatus: DepartmentStatus;

  @ApiProperty({
    description: 'Department ID where the return is happening',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Department ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Department ID is required' })
  departmentId: string;

  @ApiProperty({
    description: 'User ID performing the action',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @ApiProperty({
    description: 'Password for authentication',
    example: 'securePassword123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiPropertyOptional({
    description: 'Reason for return',
    example: 'Quality issue found, needs re-cutting',
  })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Optional notes',
    example: 'Returning to cutting stage for correction',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}


