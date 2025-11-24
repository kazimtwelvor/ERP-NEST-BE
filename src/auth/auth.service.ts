import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { SignUpDto, LoginDto } from './dto/auth.dto';
import { VerifyEmailDto, ResendVerificationDto } from '../user/dto/verify-email.dto';
import { EmailService } from '../email/email.service';
import { randomInt } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: signUpDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
    
    // Generate verification code
    const verificationCode = this.generateVerificationCode();
    
    const user = this.userRepository.create({
      ...signUpDto,
      password: hashedPassword,
      verificationCode,
      isEmailVerified: false,
    });

    await this.userRepository.save(user);
    
    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationCode,
        user.firstName,
      );
    } catch (error) {
      console.error('❌ Failed to send verification email:', error.message || error);
      console.log(`📧 Verification code for ${user.email}: ${verificationCode}`);
      // Continue even if email fails - code is still saved
    }
    
    const { password, verificationCode: code, ...result } = user;
    return {
      ...result,
      message: 'User registered successfully. Please check your email to verify your account.',
    };
  }

  private generateVerificationCode(): string {
    return randomInt(100000, 999999).toString();
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !await bcrypt.compare(loginDto.password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // Update last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  // Password reset functionality can be added later if needed
  // This would require adding resetToken and resetTokenExpiry fields to User entity

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.userRepository.findOne({
      where: { email: verifyEmailDto.email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (user.verificationCode !== verifyEmailDto.code) {
      throw new BadRequestException('Invalid verification code');
    }

    user.isEmailVerified = true;
    user.verificationCode = '';
    await this.userRepository.save(user);

    return { message: 'Email verified successfully' };
  }

  async resendVerificationCode(resendDto: ResendVerificationDto) {
    const user = await this.userRepository.findOne({
      where: { email: resendDto.email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationCode = this.generateVerificationCode();
    user.verificationCode = verificationCode;
    await this.userRepository.save(user);

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationCode,
        user.firstName,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new BadRequestException('Failed to send verification email. Please try again later.');
    }

    return { message: 'Verification code sent successfully. Please check your email.' };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'department'],
      select: ['id', 'email', 'firstName', 'lastName', 'status', 'isEmailVerified', 'createdAt'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}