import { IsString, IsNotEmpty, IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AdjustStockDto {
  @ApiProperty({ description: 'Inventory item ID (UUID)' })
  @IsUUID('4')
  @IsNotEmpty()
  inventoryItemId: string;

  @ApiProperty({ description: 'Quantity to add (positive) or remove (negative)', example: 10 })
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  quantity: number;
}






