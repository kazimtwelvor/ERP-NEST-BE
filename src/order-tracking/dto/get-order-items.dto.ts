import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetOrderItemsDto {
  @ApiPropertyOptional({
    description: 'Store name to filter by',
    example: 'fineyst-jackets',
  })
  @IsString()
  @IsOptional()
  storeName?: string;

  @ApiPropertyOptional({
    description: 'Current status to filter by',
    example: 'pending',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Department ID to filter by',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Department ID must be a valid UUID' })
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Role ID to filter by visibility (user must have this role to see items)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Role ID must be a valid UUID' })
  @IsOptional()
  roleId?: string;

  @ApiPropertyOptional({
    description: 'Role name to filter by visibility (user must have this role to see items)',
    example: 'cutting-manager',
  })
  @IsString()
  @IsOptional()
  roleName?: string;

  @ApiPropertyOptional({
    description: 'Array of role IDs to filter by visibility',
    example: ['uuid-1', 'uuid-2'],
    type: [String],
  })
  @IsArray({ message: 'Role IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each role ID must be a valid UUID' })
  @IsOptional()
  roleIds?: string[];

  @ApiPropertyOptional({
    description: 'Array of role names to filter by visibility',
    example: ['cutting-manager', 'production-manager'],
    type: [String],
  })
  @IsArray({ message: 'Role names must be an array' })
  @IsString({ each: true, message: 'Each role name must be a string' })
  @IsOptional()
  roleNames?: string[];

  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  @IsOptional()
  limit?: number = 10;
}


