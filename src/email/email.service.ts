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
          <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0a0a0a;">
              <tr>
                <td align="center" style="padding: 60px 20px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px;">
                    
                    <!-- Logo/Brand -->
                    <tr>
                      <td align="center" style="padding-bottom: 40px;">
                        <table border="0" cellpadding="0" cellspacing="0" style="display: inline-block;">
                          <tr>
                            <td style="background: #6ba3e8; padding: 12px 24px; border-radius: 8px;">
                              <table border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="padding-right: 12px; vertical-align: middle;">
                                    <div style="width: 28px; height: 28px; background: #000000; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                                      <div style="width: 16px; height: 16px; background: #6ba3e8; border-radius: 3px;"></div>
                                    </div>
                                  </td>
                                  <td style="vertical-align: middle;">
                                    <h1 style="margin: 0; color: #000000; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; white-space: nowrap;">
                                      AI Ratelimit
                                    </h1>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Main Card -->
                    <tr>
                      <td style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          
                          <!-- Content -->
                          <tr>
                            <td style="padding: 48px 40px;">
                              <h2 style="margin: 0 0 12px; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
                                ${heading}
                              </h2>
                              <p style="margin: 0 0 32px; color: #a0a0a0; font-size: 15px; line-height: 24px;">
                                ${description}
                              </p>
                              
                              <!-- Button -->
                              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                  <td align="center" style="padding: 8px 0 32px;">
                                    <a href="${magicLink}" 
                                       style="display: inline-block; background: #6ba3e8; color: #000000; font-size: 15px; font-weight: 600; text-decoration: none; padding: 16px 48px; border-radius: 8px; box-shadow: 0 2px 8px rgba(107, 163, 232, 0.3);">
                                      ${buttonText}
                                    </a>
                                  </td>
                                </tr>
                              </table>
                              
                              <!-- Security Note -->
                              <div style="background: rgba(107, 163, 232, 0.12); padding: 16px 20px; border-radius: 6px;">
                                <p style="margin: 0; color: #6ba3e8; font-size: 13px; line-height: 20px;">
                                  <strong>Security:</strong> This link expires in 15 minutes
                                </p>
                              </div>
                            </td>
                          </tr>
                          
                          <!-- Footer -->
                          <tr>
                            <td style="padding: 24px 40px; background: rgba(0, 0, 0, 0.3); border-top: 1px solid #2a2a2a;">
                              <p style="margin: 0; color: #666666; font-size: 12px; line-height: 18px; text-align: center;">
                                If you didn't request this email, you can safely ignore it.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Bottom Spacing -->
                    <tr>
                      <td style="padding-top: 32px; text-align: center;">
                        <p style="margin: 0; color: #4a4a4a; font-size: 11px; line-height: 16px;">
                          © ${new Date().getFullYear()} AI Ratelimit. Built for developers.
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
