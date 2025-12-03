import {
  IsArray,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DepartmentStatus } from '../../order-tracking/enums/department-status.enum';

export class DepartmentStatusItemDto {
  @ApiProperty({
    description: 'Status value from DepartmentStatus enum',
    enum: DepartmentStatus,
    example: DepartmentStatus.CUTTING_IN_PROGRESS,
  })
  @IsEnum(DepartmentStatus, { message: 'Invalid department status' })
  @IsString()
  status: string;

  @ApiPropertyOptional({
    description: 'Display order for sorting',
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number = 0;

  @ApiPropertyOptional({
    description: 'Whether this status is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class AssignDepartmentStatusesDto {
  @ApiProperty({
    description: 'Array of department statuses to assign',
    type: [DepartmentStatusItemDto],
  })
  @IsArray({ message: 'Statuses must be an array' })
  @ValidateNested({ each: true })
  @Type(() => DepartmentStatusItemDto)
  statuses: DepartmentStatusItemDto[];
}

