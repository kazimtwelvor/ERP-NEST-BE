import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({ description: 'Status value', example: 'production' })
  @IsString()
  @IsNotEmpty()
  status: string;
}
