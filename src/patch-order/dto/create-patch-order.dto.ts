import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PatchFormType } from '../entities/patch-order.entity';

export class CreatePatchOrderDto {
  @ApiPropertyOptional({ description: 'Customer full name' })
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Customer email address' })
  @IsOptional()
  customerEmail?: string;

  @ApiPropertyOptional({ description: 'Customer phone number' })
  @IsOptional()
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'External or client order identifier' })
  @IsOptional()
  orderId?: string;

  @ApiPropertyOptional({
    description: 'Submitted form type',
    enum: PatchFormType,
  })
  @IsOptional()
  formType?: PatchFormType;

  @ApiPropertyOptional({ description: 'Requested patch shape' })
  @IsOptional()
  shape?: string;

  @ApiPropertyOptional({ description: 'Requested patch size' })
  @IsOptional()
  size?: string;

  @ApiPropertyOptional({ description: 'Requested quantity' })
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Backing type for the patch' })
  @IsOptional()
  backingType?: string;

  @ApiPropertyOptional({ description: 'Embroidery coverage details' })
  @IsOptional()
  embroideryCoverage?: string;

  @ApiPropertyOptional({ description: 'Border style for the patch' })
  @IsOptional()
  border?: string;

  @ApiPropertyOptional({ description: 'Primary color for the patch' })
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({
    description: 'Image reference or URL for the patch design',
  })
  @IsOptional()
  image?: string;
}
