import { IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { Type } from 'class-transformer';

export class GetInventoryItemsDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID('4')
  @ApiPropertyOptional({ description: 'Filter by product ID' })
  productId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @ApiPropertyOptional({ description: 'Filter low stock items only' })
  lowStock?: boolean;
}
