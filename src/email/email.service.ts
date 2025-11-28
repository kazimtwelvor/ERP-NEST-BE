import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    const emailUser = this.configService.get<string>('EMAIL_USER')?.trim().replace(/^["']|["']$/g, '');
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD')?.trim().replace(/^["']|["']$/g, '');

    if (!emailUser || !emailPassword) {
      console.warn('⚠️ EMAIL_USER or EMAIL_PASSWORD not found in environment variables.');
      console.warn('⚠️ Email functionality will be disabled. Add these to your .env file:');
      console.warn('   EMAIL_USER=your-email@gmail.com');
      console.warn('   EMAIL_PASSWORD=your-app-password');
      console.warn('   Current EMAIL_USER:', emailUser ? 'Set' : 'NOT SET');
      console.warn('   Current EMAIL_PASSWORD:', emailPassword ? 'Set' : 'NOT SET');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      
      // Test the connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Email transporter verification failed:', error.message);
          console.error('   Make sure you are using a Gmail App Password, not your regular password.');
          console.error('   Generate one at: https://myaccount.google.com/apppasswords');
        } else {
          console.log('✅ Email service configured and verified successfully');
          console.log('   From:', emailUser);
        }
      });
    } catch (error) {
      console.error('❌ Failed to configure email transporter:', error);
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    firstName: string,
  ): Promise<void> {
    if (!this.transporter) {
      console.warn('⚠️ Email transporter not configured. EMAIL_USER and EMAIL_PASSWORD must be set in .env file.');
      console.warn('⚠️ Skipping email send. Reset token:', resetToken);
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env file.');
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const resetLink = `${frontendUrl}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;

    const htmlTemplate = this.getPasswordResetEmailTemplate(
      firstName,
      resetToken,
      resetLink,
    );

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: email,
      subject: 'Reset Your Password - ERP System',
      html: htmlTemplate,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${email}`);
      console.log(`   Message ID: ${info.messageId}`);
    } catch (error: any) {
      console.error('❌ Error sending password reset email:', error.message || error);
      if (error.code === 'EAUTH') {
        console.error('   Authentication failed. Check your EMAIL_USER and EMAIL_PASSWORD.');
        console.error('   Make sure you are using a Gmail App Password.');
      } else if (error.code === 'ECONNECTION') {
        console.error('   Connection failed. Check your internet connection.');
      }
      throw new Error(`Failed to send password reset email: ${error.message || error}`);
    }
  }

  async sendVerificationEmail(
    email: string,
    verificationCode: string,
    firstName: string,
  ): Promise<void> {
    if (!this.transporter) {
      console.warn('⚠️ Email transporter not configured. EMAIL_USER and EMAIL_PASSWORD must be set in .env file.');
      console.warn('⚠️ Skipping email send. Verification code:', verificationCode);
      console.log(`📧 Verification code for ${email}: ${verificationCode}`);
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env file.');
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const verificationLink = `${frontendUrl}/auth/verify-email?email=${encodeURIComponent(email)}&code=${verificationCode}`;

    const htmlTemplate = this.getVerificationEmailTemplate(
      firstName,
      verificationCode,
      verificationLink,
    );

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: email,
      subject: 'Verify Your Email Address - ERP System',
      html: htmlTemplate,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to ${email}`);
      console.log(`   Message ID: ${info.messageId}`);
    } catch (error: any) {
      console.error('❌ Error sending verification email:', error.message || error);
      if (error.code === 'EAUTH') {
        console.error('   Authentication failed. Check your EMAIL_USER and EMAIL_PASSWORD.');
        console.error('   Make sure you are using a Gmail App Password.');
      } else if (error.code === 'ECONNECTION') {
        console.error('   Connection failed. Check your internet connection.');
      }
      throw new Error(`Failed to send verification email: ${error.message || error}`);
    }
  }

  private getVerificationEmailTemplate(
    firstName: string,
    verificationCode: string,
    verificationLink: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Verify Your Email Address - ERP System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f7fa;
            padding: 0;
            margin: 0;
        }
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: #ffffff;
        }
        .email-header h1 {
            font-size: 28px;
            font-weight: 600;
            margin: 0;
            letter-spacing: -0.5px;
        }
        .email-header .icon {
            font-size: 48px;
            margin-bottom: 15px;
            display: block;
        }
        .email-body {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 500;
            color: #1a1a1a;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        .verification-section {
            background: linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        .verification-label {
            font-size: 14px;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        .verification-code {
            font-size: 42px;
            font-weight: 700;
            color: #667eea;
            letter-spacing: 8px;
            font-family: 'Courier New', 'Monaco', monospace;
            background: #ffffff;
            padding: 20px 30px;
            border-radius: 8px;
            display: inline-block;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin: 10px 0;
        }
        .button-container {
            text-align: center;
            margin: 35px 0;
        }
        .verify-button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            letter-spacing: 0.5px;
        }
        .verify-button:link,
        .verify-button:visited,
        .verify-button:hover,
        .verify-button:active {
            color: #ffffff !important;
        }
        .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
        }
        .link-section {
            margin: 30px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .link-section p {
            font-size: 14px;
            color: #4a5568;
            margin-bottom: 10px;
        }
        .link-section a {
            color: #667eea;
            word-break: break-all;
            text-decoration: none;
            font-size: 13px;
        }
        .security-notice {
            background-color: #fff8e1;
            border-left: 4px solid #ffc107;
            padding: 20px;
            margin: 30px 0;
            border-radius: 8px;
        }
        .security-notice strong {
            color: #f57c00;
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .security-notice p {
            color: #5d4037;
            font-size: 14px;
            margin: 0;
            line-height: 1.6;
        }
        .support-section {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
        }
        .support-section p {
            color: #718096;
            font-size: 15px;
            margin: 10px 0;
        }
        .email-footer {
            background-color: #2d3748;
            color: #a0aec0;
            padding: 30px;
            text-align: center;
            font-size: 13px;
            line-height: 1.8;
        }
        .email-footer p {
            margin: 5px 0;
        }
        .email-footer a {
            color: #667eea;
            text-decoration: none;
        }
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e2e8f0, transparent);
            margin: 30px 0;
        }
        @media only screen and (max-width: 600px) {
            .email-body {
                padding: 30px 20px;
            }
            .email-header {
                padding: 30px 20px;
            }
            .verification-code {
                font-size: 32px;
                letter-spacing: 4px;
                padding: 15px 20px;
            }
            .verify-button {
                padding: 14px 30px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-header">
            <span class="icon">✉️</span>
            <h1>Verify Your Email Address</h1>
        </div>
        
        <div class="email-body">
            <div class="greeting">
                Hello ${firstName},
            </div>
            
            <div class="message">
                Thank you for registering with our ERP System! We're excited to have you on board. 
                To complete your registration and activate your account, please verify your email address 
                by clicking the button below or using the verification code provided.
            </div>

            <div class="verification-section">
                <div class="verification-label">Your Verification Code</div>
                <div class="verification-code">${verificationCode}</div>
                <p style="color: #718096; font-size: 13px; margin-top: 15px;">
                    This code will expire in 24 hours
                </p>
            </div>

            <div class="button-container">
                <a href="${verificationLink}" class="verify-button">Verify Email Address</a>
            </div>

            <div class="link-section">
                <p><strong>Prefer to verify manually?</strong></p>
                <p>Copy and paste this link into your browser:</p>
                <a href="${verificationLink}">${verificationLink}</a>
            </div>

            <div class="security-notice">
                <strong>🔒 Security Notice</strong>
                <p>
                    If you didn't create an account with us, please ignore this email. 
                    Your account security is important to us, and we'll never ask you to verify 
                    an account you didn't create.
                </p>
            </div>

            <div class="divider"></div>

            <div class="support-section">
                <p><strong>Need Help?</strong></p>
                <p>If you have any questions or need assistance, our support team is here to help.</p>
                <p style="margin-top: 15px;">
                    <a href="mailto:support@erpsystem.com" style="color: #667eea;">Contact Support</a>
                </p>
            </div>
        </div>

        <div class="email-footer">
            <p><strong>ERP System</strong></p>
            <p>Enterprise Resource Planning Solution</p>
            <p style="margin-top: 20px; font-size: 12px;">
                This is an automated email. Please do not reply to this message.
            </p>
            <p style="font-size: 12px; margin-top: 10px;">
                &copy; ${new Date().getFullYear()} ERP System. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  private getPasswordResetEmailTemplate(
    firstName: string,
    resetToken: string,
    resetLink: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Reset Your Password - ERP System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f7fa;
            padding: 0;
            margin: 0;
        }
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: #ffffff;
        }
        .email-header h1 {
            font-size: 28px;
            font-weight: 600;
            margin: 0;
            letter-spacing: -0.5px;
        }
        .email-header .icon {
            font-size: 48px;
            margin-bottom: 15px;
            display: block;
        }
        .email-body {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 500;
            color: #1a1a1a;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        .button-container {
            text-align: center;
            margin: 35px 0;
        }
        .reset-button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            letter-spacing: 0.5px;
        }
        .reset-button:link,
        .reset-button:visited,
        .reset-button:hover,
        .reset-button:active {
            color: #ffffff !important;
        }
        .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
        }
        .link-section {
            margin: 30px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .link-section p {
            font-size: 14px;
            color: #4a5568;
            margin-bottom: 10px;
        }
        .link-section a {
            color: #667eea;
            word-break: break-all;
            text-decoration: none;
            font-size: 13px;
        }
        .security-notice {
            background-color: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 20px;
            margin: 30px 0;
            border-radius: 8px;
        }
        .security-notice strong {
            color: #e65100;
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .security-notice p {
            color: #5d4037;
            font-size: 14px;
            margin: 0;
            line-height: 1.6;
        }
        .expiry-notice {
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            text-align: center;
        }
        .expiry-notice p {
            color: #1565c0;
            font-size: 14px;
            margin: 0;
            font-weight: 500;
        }
        .support-section {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
        }
        .support-section p {
            color: #718096;
            font-size: 15px;
            margin: 10px 0;
        }
        .email-footer {
            background-color: #2d3748;
            color: #a0aec0;
            padding: 30px;
            text-align: center;
            font-size: 13px;
            line-height: 1.8;
        }
        .email-footer p {
            margin: 5px 0;
        }
        .email-footer a {
            color: #667eea;
            text-decoration: none;
        }
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e2e8f0, transparent);
            margin: 30px 0;
        }
        @media only screen and (max-width: 600px) {
            .email-body {
                padding: 30px 20px;
            }
            .email-header {
                padding: 30px 20px;
            }
            .reset-button {
                padding: 14px 30px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-header">
            <span class="icon">🔑</span>
            <h1>Reset Your Password</h1>
        </div>
        
        <div class="email-body">
            <div class="greeting">
                Hello ${firstName},
            </div>
            
            <div class="message">
                We received a request to reset your password for your ERP System account. 
                If you made this request, click the button below to reset your password. 
                If you didn't request a password reset, you can safely ignore this email.
            </div>

            <div class="expiry-notice">
                <p>⏰ This link will expire in 1 hour</p>
            </div>

            <div class="button-container">
                <a href="${resetLink}" class="reset-button">Reset Password</a>
            </div>

            <div class="link-section">
                <p><strong>Button not working?</strong></p>
                <p>Copy and paste this link into your browser:</p>
                <a href="${resetLink}">${resetLink}</a>
            </div>

            <div class="security-notice">
                <strong>🔒 Security Notice</strong>
                <p>
                    For your security, this password reset link can only be used once and will expire in 1 hour. 
                    If you didn't request a password reset, please ignore this email or contact our support team 
                    if you have concerns about your account security.
                </p>
            </div>

            <div class="divider"></div>

            <div class="support-section">
                <p><strong>Need Help?</strong></p>
                <p>If you have any questions or need assistance, our support team is here to help.</p>
                <p style="margin-top: 15px;">
                    <a href="mailto:support@erpsystem.com" style="color: #667eea;">Contact Support</a>
                </p>
            </div>
        </div>

        <div class="email-footer">
            <p><strong>ERP System</strong></p>
            <p>Enterprise Resource Planning Solution</p>
            <p style="margin-top: 20px; font-size: 12px;">
                This is an automated email. Please do not reply to this message.
            </p>
            <p style="font-size: 12px; margin-top: 10px;">
                &copy; ${new Date().getFullYear()} ERP System. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }
}

