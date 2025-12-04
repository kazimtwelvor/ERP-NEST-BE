import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';
import { IsArray, IsUUID, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatusItemDto } from './assign-order-statuses.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiPropertyOptional({
    description: 'Array of permission IDs to assign to this role',
    type: [String],
    example: ['uuid1', 'uuid2'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  permissionIds?: string[];

  @ApiPropertyOptional({
    description: 'Array of order statuses to assign to this role',
    type: [OrderStatusItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderStatusItemDto)
  @IsOptional()
  orderStatuses?: OrderStatusItemDto[];
}

