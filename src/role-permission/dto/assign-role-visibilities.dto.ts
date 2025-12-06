import {
  IsArray,
  IsString,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleVisibilityItemDto {
  @ApiProperty({
    description: 'The role ID that should be visible to the role',
    example: 'cfdd3501-ee68-4454-9580-fd1f125a8ce6',
  })
  @IsUUID('4', { message: 'Visible role ID must be a valid UUID' })
  @IsString()
  visibleRoleId: string;

  @ApiPropertyOptional({
    description: 'Display order for sorting',
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number = 0;

  @ApiPropertyOptional({
    description: 'Whether this visibility is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class AssignRoleVisibilitiesDto {
  @ApiProperty({
    description: 'Array of role visibilities to assign',
    type: [RoleVisibilityItemDto],
  })
  @IsArray({ message: 'Role visibilities must be an array' })
  @ValidateNested({ each: true })
  @Type(() => RoleVisibilityItemDto)
  roleVisibilities: RoleVisibilityItemDto[];
}

