import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckInOrderItemDto {
  @ApiProperty({
    description: 'QR code of the order item',
    example: 'ORDER_ITEM_UUID_HASH',
  })
  @IsString()
  @IsNotEmpty({ message: 'QR code is required' })
  qrCode: string;

  @ApiProperty({
    description: 'Department ID where the item is being checked in',
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
    enum: ['in-house', 'outsourced'],
    example: 'in-house',
  })
  @IsEnum(['in-house', 'outsourced'], { message: 'Preparation type must be in-house or outsourced' })
  @IsOptional()
  preparationType?: string;

  @ApiPropertyOptional({
    description: 'Initial department-specific status (e.g., cutting_in_progress, leather_availability_pending)',
    example: 'cutting_in_progress',
  })
  @IsString()
  @IsOptional()
  departmentStatus?: string;

  @ApiPropertyOptional({
    description: 'Optional notes for the check-in',
    example: 'Item received in good condition',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

