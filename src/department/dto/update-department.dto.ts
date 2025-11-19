import { PartialType } from '@nestjs/swagger';
import { CreateDepartmentDto } from './create-department.dto';
import { IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {
  @ApiPropertyOptional({
    description: 'Department code (unique identifier)',
    example: 'STCH',
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Department code must be at least 2 characters' })
  @MaxLength(10, { message: 'Department code must not exceed 10 characters' })
  @Matches(/^[A-Z0-9]+$/, { message: 'Department code must contain only uppercase letters and numbers' })
  code?: string;
}
