import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto, SortEnum } from '../../common/dto/pagination.dto';

export class GetUsersDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID('4')
  @ApiPropertyOptional({ description: 'Filter by role ID (UUID)' })
  roleId?: string;

  @IsOptional()
  @IsString()
  @IsUUID('4')
  @ApiPropertyOptional({ description: 'Filter by department ID (UUID)' })
  departmentId?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['active', 'inactive', 'suspended'])
  @ApiPropertyOptional({
    description: 'Filter by user status',
    enum: ['active', 'inactive', 'suspended'],
  })
  status?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['true', 'false'])
  @ApiPropertyOptional({
    description: 'Filter by email verification status',
    enum: ['true', 'false'],
  })
  isEmailVerified?: string;
}
