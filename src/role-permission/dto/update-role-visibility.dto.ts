import { IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoleVisibilityDto {
  @ApiPropertyOptional({
    description: 'Display order for sorting',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether this visibility is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

