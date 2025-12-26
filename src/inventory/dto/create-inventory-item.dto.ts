import { IsString, IsNotEmpty, IsOptional, IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateInventoryItemDto {
  @ApiProperty({ description: 'Product ID (UUID)' })
  @IsUUID('4')
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ description: 'Initial quantity', example: 0, default: 0 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Reorder level', example: 10 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  reorderLevel?: number;
}
