import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class GetPermissionsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @IsEnum(['user', 'product', 'order', 'inventory', 'customer', 'supplier', 'report', 'settings'])
  @ApiPropertyOptional({
    description: 'Filter by module',
    enum: ['user', 'product', 'order', 'inventory', 'customer', 'supplier', 'report', 'settings'],
  })
  module?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['create', 'read', 'update', 'delete', 'manage'])
  @ApiPropertyOptional({
    description: 'Filter by action',
    enum: ['create', 'read', 'update', 'delete', 'manage'],
  })
  action?: string;
}

