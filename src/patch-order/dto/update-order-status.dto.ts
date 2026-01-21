import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ description: 'Order status value', example: 'sample_approved' })
  @IsString()
  @IsNotEmpty()
  orderStatus: string;
}
