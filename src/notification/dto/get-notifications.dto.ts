import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class GetNotificationsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by read status', example: 'false' })
  isRead?: string;

  @IsOptional()
  @IsUUID('4')
  @ApiPropertyOptional({ description: 'Filter by user ID (UUID)' })
  userId?: string;
}
