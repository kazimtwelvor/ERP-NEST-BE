import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetAbandonedPatchOrdersDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be greater than 0' })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of records per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be greater than 0' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Form type to filter abandoned patch orders',
    example: 'contactForm',
  })
  @IsString()
  @IsOptional()
  formType?: string;

  @ApiPropertyOptional({
    description:
      'Number of hours to consider as abandonment threshold (default: 48 hours)',
    example: 48,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'Threshold hours must be an integer' })
  @Min(1, { message: 'Threshold hours must be at least 1' })
  @IsOptional()
  thresholdHours?: number = 48;

  @ApiPropertyOptional({
    description: 'Sort by field (updated_at, created_at)',
    example: 'updated_at',
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'updated_at';

  @ApiPropertyOptional({
    description: 'Sort order (asc, desc)',
    example: 'asc',
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
