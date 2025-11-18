import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { USER_MESSAGES } from '../messages/user.messages';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: USER_MESSAGES.INVALID_EMAIL })
  @IsNotEmpty({ message: USER_MESSAGES.EMAIL_REQUIRED })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: USER_MESSAGES.PASSWORD_REQUIRED })
  @MinLength(8, { message: USER_MESSAGES.PASSWORD_TOO_SHORT })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty({ message: USER_MESSAGES.FIRST_NAME_REQUIRED })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty({ message: USER_MESSAGES.LAST_NAME_REQUIRED })
  lastName: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'User address',
    example: '123 Main Street',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'User city',
    example: 'New York',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'User state',
    example: 'NY',
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    description: 'User postal code',
    example: '10001',
  })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'User country',
    example: 'USA',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    description: 'User role',
    enum: ['admin', 'manager', 'employee', 'customer'],
    default: 'employee',
  })
  @IsEnum(['admin', 'manager', 'employee', 'customer'])
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({
    description: 'User status',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  })
  @IsEnum(['active', 'inactive', 'suspended'])
  @IsOptional()
  status?: string;
}
