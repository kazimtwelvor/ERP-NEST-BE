import { Controller, Post, Body, Get, UseGuards, Request, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto, LoginDto } from './dto/auth.dto';
import { VerifyEmailDto, ResendVerificationDto } from '../user/dto/verify-email.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Response } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register new user' })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Password reset endpoints can be added later if needed

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify user email with verification code (POST)' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify user email with verification code (GET - via email link)' })
  @ApiQuery({ name: 'email', required: true, description: 'User email address' })
  @ApiQuery({ name: 'code', required: true, description: 'Verification code' })
  async verifyEmailGet(
    @Query('email') email: string,
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    const result = await this.authService.verifyEmail({ email, code });
    
    // Redirect to frontend success page or show success message
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/email-verified?success=true`;
    
    return res.redirect(redirectUrl);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification code to user email' })
  async resendVerificationCode(@Body() resendDto: ResendVerificationDto) {
    return this.authService.resendVerificationCode(resendDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }
}