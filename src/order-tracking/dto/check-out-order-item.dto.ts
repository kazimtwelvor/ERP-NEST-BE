import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckOutOrderItemDto {
  @ApiProperty({
    description: 'QR code of the order item',
    example: 'ORDER_ITEM_UUID_HASH',
  })
  @IsString()
  @IsNotEmpty({ message: 'QR code is required' })
  qrCode: string;

  @ApiProperty({
    description: 'Department ID where the item is being checked out from',
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

  @ApiProperty({
    description: 'Department ID to hand over to (next department)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Handed over department ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Handed over department ID is required' })
  handedOverDepartmentId: string;

  @ApiPropertyOptional({
    description: 'Optional notes for the check-out',
    example: 'Item completed processing',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

