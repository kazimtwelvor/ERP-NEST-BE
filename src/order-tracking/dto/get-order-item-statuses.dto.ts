import {
  IsString,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetOrderItemStatusesDto {
  @ApiPropertyOptional({
    description: 'Order item ID (UUID) - required if externalOrderId is not provided',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Order item ID must be a valid UUID' })
  @IsOptional()
  orderItemId?: string;

  @ApiPropertyOptional({
    description: 'External order ID to filter by - fetches all order items with this external order ID',
    example: 'ORD-12345',
  })
  @IsString()
  @IsOptional()
  externalOrderId?: string;
}


