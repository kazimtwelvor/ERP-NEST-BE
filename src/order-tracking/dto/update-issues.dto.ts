import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateIssuesDto {
  @ApiPropertyOptional({
    description: 'Issues or notes related to the order item',
    example: 'Quality issue: Stitching defect found',
  })
  @IsString()
  @IsOptional()
  issues?: string | null;
}

