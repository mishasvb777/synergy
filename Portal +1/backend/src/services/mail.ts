import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { query } from '../db/pool.js';

let transporter: Transporter | null = null;
let transporterMode: 'smtp' | 'ethereal' | 'console' = 'console';

async function getTransporter(): Promise<Transporter | null> {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    transporterMode = 'smtp';
    return transporter;
  }

  if (process.env.SMTP_ETHEREAL === '1') {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    transporterMode = 'ethereal';
    console.log('Mail: Ethereal test account', testAccount.user);
    return transporter;
  }

  transporterMode = 'console';
  return null;
}

export type SendMailResult = {
  mode: 'smtp' | 'ethereal' | 'console';
  previewUrl?: string;
};

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<SendMailResult> {
  await query(
    `INSERT INTO email_outbox (recipient, subject, body) VALUES ($1, $2, $3)`,
    [options.to, options.subject, options.text]
  );

  const tx = await getTransporter();
  if (!tx) {
    console.log('--- MAIL (console) ---');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log(options.text);
    console.log('----------------------');
    return { mode: 'console' };
  }

  const info = await tx.sendMail({
    from: process.env.SMTP_FROM || 'Портал+1 <noreply@innotech.local>',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html || `<pre>${options.text}</pre>`,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
  if (previewUrl) console.log('Ethereal preview:', previewUrl);
  return { mode: transporterMode, previewUrl };
}

export function appPublicUrl(): string {
  return (process.env.APP_PUBLIC_URL || 'http://localhost:5173').replace(/\/$/, '');
}

export function buildConfirmEmailMessage(fullName: string, confirmUrl: string) {
  const text = [
    `Здравствуйте, ${fullName}!`,
    '',
    'Вы зарегистрировались в корпоративном портале «Портал+1».',
    'Чтобы активировать учётную запись, подтвердите адрес электронной почты:',
    confirmUrl,
    '',
    'Ссылка действует 24 часа.',
    'Если вы не регистрировались — просто проигнорируйте это письмо.',
  ].join('\n');

  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.5;color:#1C2422">
      <h2 style="color:#2D8C7A">Портал+1</h2>
      <p>Здравствуйте, <b>${fullName}</b>!</p>
      <p>Чтобы активировать учётную запись, подтвердите адрес электронной почты:</p>
      <p><a href="${confirmUrl}" style="display:inline-block;padding:10px 16px;background:#2D8C7A;color:#fff;border-radius:10px;text-decoration:none">Подтвердить почту</a></p>
      <p style="color:#6F7A76;font-size:13px">Или откройте ссылку:<br/>${confirmUrl}</p>
      <p style="color:#6F7A76;font-size:13px">Ссылка действует 24 часа.</p>
    </div>
  `;

  return { text, html };
}
