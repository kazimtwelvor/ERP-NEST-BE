import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class GetDepartmentsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @IsEnum(['active', 'inactive'])
  @ApiPropertyOptional({
    description: 'Filter by department status',
    enum: ['active', 'inactive'],
  })
  status?: string;

  @IsOptional()
  @IsString()
  @IsUUID('4')
  @ApiPropertyOptional({ description: 'Filter by manager ID (UUID)' })
  managerId?: string;
}

