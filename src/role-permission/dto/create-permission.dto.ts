import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ROLE_PERMISSION_MESSAGES } from '../messages/role-permission.messages';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Permission name (unique identifier)',
    example: 'user.create',
  })
  @IsString()
  @IsNotEmpty({ message: ROLE_PERMISSION_MESSAGES.PERMISSION_NAME_REQUIRED })
  name: string;

  @ApiProperty({
    description: 'Permission display name',
    example: 'Create User',
  })
  @IsString()
  @IsNotEmpty({ message: ROLE_PERMISSION_MESSAGES.PERMISSION_DISPLAY_NAME_REQUIRED })
  displayName: string;

  @ApiPropertyOptional({
    description: 'Permission description',
    example: 'Allows creating new users in the system',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Module/Resource this permission belongs to',
    example: 'user',
    enum: ['user', 'product', 'order', 'inventory', 'customer', 'supplier', 'report', 'settings'],
  })
  @IsEnum(['user', 'product', 'order', 'inventory', 'customer', 'supplier', 'report', 'settings'])
  @IsNotEmpty({ message: ROLE_PERMISSION_MESSAGES.MODULE_REQUIRED })
  module: string;

  @ApiProperty({
    description: 'Action type',
    example: 'create',
    enum: ['create', 'read', 'update', 'delete', 'manage'],
  })
  @IsEnum(['create', 'read', 'update', 'delete', 'manage'])
  @IsNotEmpty({ message: ROLE_PERMISSION_MESSAGES.ACTION_REQUIRED })
  action: string;
}

