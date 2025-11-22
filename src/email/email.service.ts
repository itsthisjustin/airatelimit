import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private isProduction: boolean;

  constructor(private configService: ConfigService) {
    this.isProduction = this.configService.get('nodeEnv') === 'production';

    // Initialize Resend if API key is available (works in both dev and prod)
    const apiKey = this.configService.get<string>('resendApiKey');
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend email service initialized');
    } else {
      this.logger.warn('RESEND_API_KEY not set - emails will be logged to console');
    }
  }

  async sendMagicLink(
    email: string,
    magicLink: string,
    isNewUser: boolean = false,
  ): Promise<void> {
    if (this.resend) {
      // Send via Resend if API key is configured
      await this.sendViaResend(email, magicLink, isNewUser);
    } else {
      // Fall back to console logging if no API key
      this.logMagicLinkToConsole(email, magicLink, isNewUser);
    }
  }

  private async sendViaResend(
    email: string,
    magicLink: string,
    isNewUser: boolean,
  ): Promise<void> {
    try {
      const fromEmail =
        this.configService.get<string>('emailFrom') ||
        'AI Ratelimit <noreply@airatelimit.com>';

      const subject = isNewUser
        ? 'Welcome to AI Ratelimit'
        : 'Sign in to AI Ratelimit';

      const heading = isNewUser
        ? 'Welcome to AI Ratelimit! Complete your signup'
        : 'Sign in to your account';

      const description = isNewUser
        ? 'Click the link below to complete your account setup. This link will expire in 15 minutes.'
        : 'Click the link below to sign in to your account. This link will expire in 15 minutes.';

      const buttonText = isNewUser ? 'Complete Signup' : 'Sign In';

      await this.resend.emails.send({
        from: fromEmail,
        to: email,
        subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f5;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 30px; background: #8ec5ff;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-family: Arial, sans-serif; font-weight: 600;">
                          AI Ratelimit
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 20px; font-family: Arial, sans-serif; font-weight: 600;">
                          ${heading}
                        </h2>
                        <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif;">
                          ${description}
                        </p>
                        
                        <!-- Button -->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td align="center" style="padding: 20px 0;">
                              <a href="${magicLink}" 
                                 style="display: inline-block; background-color: #8ec5ff; color: #000000; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-family: Arial, sans-serif;">
                                ${buttonText}
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 24px 0 0; color: #718096; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">
                          This link will expire in <strong>15 minutes</strong> for security reasons.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; background-color: #f7fafc; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 0; color: #a0aec0; font-size: 12px; line-height: 18px; font-family: Arial, sans-serif;">
                          If you didn't request this email, you can safely ignore it.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });

      this.logger.log(
        `Magic link email sent to ${email} via Resend (${isNewUser ? 'new user' : 'existing user'})`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email via Resend: ${error.message}`);
      throw new Error('Failed to send magic link email');
    }
  }

  private logMagicLinkToConsole(
    email: string,
    magicLink: string,
    isNewUser: boolean,
  ): void {
    const type = isNewUser ? 'SIGNUP' : 'LOGIN';

    this.logger.log('\n' + '='.repeat(80));
    this.logger.log(`🔐 MAGIC LINK ${type}`);
    this.logger.log('='.repeat(80));
    this.logger.log(`📧 Email: ${email}`);
    this.logger.log(`🔗 Magic Link: ${magicLink}`);
    this.logger.log('='.repeat(80) + '\n');

    console.log('\n' + '='.repeat(80));
    console.log(`🔐 MAGIC LINK ${type}`);
    console.log('='.repeat(80));
    console.log(`📧 Email: ${email}`);
    console.log(`🔗 Magic Link: ${magicLink}`);
    console.log('='.repeat(80) + '\n');
  }
}
