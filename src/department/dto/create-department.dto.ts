import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DEPARTMENT_MESSAGES } from '../messages/department.messages';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Department name',
    example: 'Stitching',
  })
  @IsString()
  @IsNotEmpty({ message: DEPARTMENT_MESSAGES.NAME_REQUIRED })
  name: string;

  @ApiProperty({
    description: 'Department code (unique identifier, typically 2-10 characters)',
    example: 'STCH',
  })
  @IsString()
  @IsNotEmpty({ message: DEPARTMENT_MESSAGES.CODE_REQUIRED })
  @MinLength(2, { message: 'Department code must be at least 2 characters' })
  @MaxLength(10, { message: 'Department code must not exceed 10 characters' })
  @Matches(/^[A-Z0-9]+$/, { message: 'Department code must contain only uppercase letters and numbers' })
  code: string;

  @ApiPropertyOptional({
    description: 'Department description',
    example: 'Handles all stitching operations and quality control',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Department status',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Manager User ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Manager ID must be a valid UUID' })
  @IsOptional()
  managerId?: string;
}
