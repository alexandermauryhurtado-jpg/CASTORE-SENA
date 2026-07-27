import nodemailer from 'nodemailer';
import { env } from './env';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
      // Gmail standard configurations
      requireTLS: env.SMTP_PORT === 587,
    });
  }
  return transporter;
}

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: MailOptions): Promise<void> {
  try {
    const info = await getTransporter().sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // Log details for debugging in development
    if (env.NODE_ENV === 'development') {
      console.error('SMTP Config:', {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        user: env.SMTP_USER,
        from: env.SMTP_FROM
      });
    }
  }
}
