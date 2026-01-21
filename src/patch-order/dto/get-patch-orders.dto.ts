import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PatchFormType } from '../entities/patch-order.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class GetPatchOrdersDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by submitted form type',
    enum: PatchFormType,
  })
  @IsOptional()
  @IsEnum(PatchFormType)
  formType?: PatchFormType;
}
