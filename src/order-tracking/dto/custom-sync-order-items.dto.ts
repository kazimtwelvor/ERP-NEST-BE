import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsObject,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class OrderItemDataDto {
  @ApiProperty({
    description: 'External order ID from store API',
    example: 'ORD-12345',
  })
  @IsString()
  @IsNotEmpty({ message: 'External order ID is required' })
  externalOrderId: string;

  @ApiProperty({
    description: 'External item ID from store API',
    example: 'ITEM-67890',
  })
  @IsString()
  @IsNotEmpty({ message: 'External item ID is required' })
  externalItemId: string;

  @ApiPropertyOptional({
    description: 'Product name',
    example: 'Leather Jacket',
  })
  @IsString()
  @IsOptional()
  productName?: string;

  @ApiPropertyOptional({
    description: 'Product SKU',
    example: 'LJ-001',
  })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({
    description: 'Product color',
    example: 'Black',
  })
  @IsString()
  @IsNotEmpty({ message: 'Color is required' })
  color: string;

  @ApiProperty({
    description: 'Product size',
    example: 'M',
  })
  @IsString()
  @IsNotEmpty({ message: 'Size is required' })
  size: string;

  @ApiProperty({
    description: 'Product gender',
    example: 'Male',
  })
  @IsString()
  @IsNotEmpty({ message: 'Gender is required' })
  gender: string;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsString()
  @IsOptional()
  productImage?: string;

  @ApiProperty({
    description: 'Quantity',
    example: 2,
    default: 1,
  })
  @IsInt({ message: 'Quantity must be an integer' })
  @IsNotEmpty({ message: 'Quantity is required' })
  quantity: number;

  @ApiPropertyOptional({
    description: 'Is leather product',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isLeather?: boolean;

  @ApiPropertyOptional({
    description: 'Is pattern product',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPattern?: boolean;


  @ApiPropertyOptional({
    description: 'Order status',
    example: 'cutting_in_progress',
  })
  @IsString()
  @IsOptional()
  orderStatus?: string;
}
export class VisibilityStatusDto {
  @ApiProperty({
    description: 'Role IDs that can view this order item',
    example: ['role-uuid-1', 'role-uuid-2'],
    type: [String],
  })
  @IsArray({ message: 'Role IDs must be an array' })
  @IsString({ each: true, message: 'Each role ID must be a string' })
  @IsNotEmpty({ message: 'At least one role ID is required' })
  roleIds: string[];

  @ApiProperty({
    description: 'Role names that can view this order item',
    example: ['cutting-manager', 'production-manager'],
    type: [String],
  })
  @IsArray({ message: 'Role names must be an array' })
  @IsString({ each: true, message: 'Each role name must be a string' })
  @IsNotEmpty({ message: 'At least one role name is required' })
  roleNames: string[];
}

export class CustomSyncOrderItemsDto {
  @ApiProperty({
    description: 'Store name',
    example: 'fineyst-jackets',
  })
  @IsString()
  @IsNotEmpty({ message: 'Store name is required' })
  storeName: string;

  @ApiProperty({
    description: 'Single order item or array of order items to sync',
    type: [OrderItemDataDto],
  })
  @IsArray({ message: 'Order items must be an array' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDataDto)
  @IsNotEmpty({ message: 'At least one order item is required' })
  orderItems: OrderItemDataDto[];

  @ApiPropertyOptional({
    description: 'Visibility status - roles that can view these order items',
    type: VisibilityStatusDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => VisibilityStatusDto)
  @IsOptional()
  visibilityStatus?: VisibilityStatusDto;

  @ApiPropertyOptional({
    description: 'User ID for tracking records (optional, for creating tracking history when orderStatus changes)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Department ID for tracking records (optional, for creating tracking history when orderStatus changes)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Department ID must be a valid UUID' })
  @IsOptional()
  departmentId?: string;
}

