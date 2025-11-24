import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SortEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ description: 'Limit of data per page', example: 10, default: 10 })
  limit?: number = 10;
}

export class PaginationQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Search query' })
  query?: string;

  @IsOptional()
  @IsString()
  @IsEnum(SortEnum)
  @ApiPropertyOptional({
    description: 'Sort orders by created date ascending or descending',
    enum: SortEnum,
    default: SortEnum.DESC,
  })
  sort?: SortEnum = SortEnum.DESC;
}
