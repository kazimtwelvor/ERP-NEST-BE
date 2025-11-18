import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ROLE_PERMISSION_MESSAGES } from '../messages/role-permission.messages';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name (unique identifier)',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty({ message: ROLE_PERMISSION_MESSAGES.ROLE_NAME_REQUIRED })
  name: string;

  @ApiProperty({
    description: 'Role display name',
    example: 'Administrator',
  })
  @IsString()
  @IsNotEmpty({ message: ROLE_PERMISSION_MESSAGES.ROLE_DISPLAY_NAME_REQUIRED })
  displayName: string;

  @ApiPropertyOptional({
    description: 'Role description',
    example: 'Full system access with all permissions',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Role status',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Array of permission IDs to assign to this role',
    type: [String],
    example: ['uuid1', 'uuid2'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  permissionIds?: string[];
}

