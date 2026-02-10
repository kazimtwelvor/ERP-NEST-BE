import { IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class GetNotificationsDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Filter by read status', example: false })
  isRead?: boolean;

  @IsOptional()
  @IsUUID('4')
  @ApiPropertyOptional({ description: 'Filter by user ID (UUID)' })
  userId?: string;
}
