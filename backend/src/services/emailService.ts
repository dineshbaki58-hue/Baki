import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const getEmailTemplate = (template: string, data: Record<string, any>): string => {
  const templates = {
    'email-verification': `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏋️‍♂️ Welcome to BakiFitness!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName}!</h2>
            <p>Thank you for joining BakiFitness! We're excited to help you achieve your fitness goals with AI-powered diet plans and personalized workouts.</p>
            <p>To get started, please verify your email address by clicking the button below:</p>
            <a href="${data.verificationLink}" class="button">Verify Email Address</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">${data.verificationLink}</p>
            <p>This link will expire in 24 hours for security reasons.</p>
          </div>
          <div class="footer">
            <p>If you didn't create an account with BakiFitness, please ignore this email.</p>
            <p>© 2024 BakiFitness. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    'password-reset': `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName}!</h2>
            <p>We received a request to reset your password for your BakiFitness account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${data.resetLink}" class="button">Reset Password</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">${data.resetLink}</p>
            <p><strong>This link will expire in 10 minutes for security reasons.</strong></p>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>© 2024 BakiFitness. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    'welcome': `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to BakiFitness!</h1>
            <p>Your fitness journey starts now!</p>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName}!</h2>
            <p>Congratulations on joining BakiFitness! We're thrilled to have you on board and excited to help you achieve your fitness goals.</p>
            
            <div class="feature">
              <h3>🤖 AI-Powered Diet Plans</h3>
              <p>Get personalized meal plans tailored to your goals, preferences, and dietary restrictions.</p>
            </div>
            
            <div class="feature">
              <h3>💪 Workout Video Library</h3>
              <p>Access hundreds of workout videos with AI recommendations based on your fitness level and goals.</p>
            </div>
            
            <div class="feature">
              <h3>📊 Progress Tracking</h3>
              <p>Track your progress with detailed analytics, photos, and measurements to stay motivated.</p>
            </div>
            
            <p>Ready to get started? Download our mobile app and begin your transformation today!</p>
          </div>
          <div class="footer">
            <p>© 2024 BakiFitness. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return templates[template as keyof typeof templates] || '';
};

export const sendEmail = async ({ to, subject, template, data }: EmailData): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const html = getEmailTemplate(template, data);
    
    if (!html) {
      throw new Error(`Email template '${template}' not found`);
    }

    const mailOptions = {
      from: `"BakiFitness" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}`);
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
};