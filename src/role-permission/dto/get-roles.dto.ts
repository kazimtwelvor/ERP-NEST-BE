import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto, SortEnum } from '../../common/dto/pagination.dto';

export class GetRolesDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @IsEnum(['active', 'inactive'])
  @ApiPropertyOptional({
    description: 'Filter by role status',
    enum: ['active', 'inactive'],
  })
  status?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['true', 'false'])
  @ApiPropertyOptional({
    description: 'Filter by system role',
    enum: ['true', 'false'],
  })
  isSystem?: string;
}
