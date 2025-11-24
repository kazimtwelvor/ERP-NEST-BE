import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification code',
    example: '123456',
    minLength: 4,
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty({ message: 'Verification code is required' })
  @Length(4, 10, { message: 'Verification code must be between 4 and 10 characters' })
  code: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class ResendVerificationDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

