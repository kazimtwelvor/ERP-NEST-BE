import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class GetTrackingHistoryDto {
  @ApiPropertyOptional({
    description: 'Order item ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Order item ID must be a valid UUID' })
  @IsOptional()
  orderItemId?: string;

  @ApiPropertyOptional({
    description: 'QR code of the order item',
    example: 'ORDER_ITEM_UUID_HASH',
  })
  @IsString()
  @IsOptional()
  qrCode?: string;

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
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
          return [value];
      }
    }
    return value;
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
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      try {
        // Try to parse as JSON (handles ["name"] format)
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // If not JSON, treat as single value
        return [value];
      }
    }
    return value;
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
  })
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @IsOptional()
  limit?: number = 10;
}

