import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class GetNotificationsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by read status', example: 'false' })
  isRead?: string;

  @IsUUID('4')
  @ApiProperty({ description: 'User ID (UUID) for read/unread computation' })
  userId: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by role name' })
  roleName?: string;
}
