import nodemailer from 'nodemailer';

// SMTP Configuration (using same variable names as Laravel)
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'mail.flyfile.it',
  port: parseInt(process.env.MAIL_PORT || '465'),
  secure: process.env.MAIL_SECURE === 'true', // true for 465 (SSL), false for 587 (TLS)
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

const FROM_NAME = process.env.MAIL_FROM_NAME || 'FlyFile';
const FROM_ADDRESS = process.env.MAIL_FROM_ADDRESS || 'no-reply@flyfile.it';
const FROM_EMAIL = `${FROM_NAME} <${FROM_ADDRESS}>`;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text,
    });

    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

// Email Templates

export function getTeamInviteEmail(params: {
  teamName: string;
  inviterName: string;
  inviteLink: string;
}) {
  const { teamName, inviterName, inviteLink } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invito al Team - FlyFile</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">FlyFile</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">Condivisione file sicura</p>
    </div>

    <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #1f2937; margin: 0 0 24px 0; font-size: 24px;">Sei stato invitato!</h2>

      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
        <strong>${inviterName}</strong> ti ha invitato a unirti al team <strong>"${teamName}"</strong> su FlyFile.
      </p>

      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 32px 0;">
        Clicca il pulsante qui sotto per accettare l'invito e iniziare a collaborare con il tuo team.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px;">
          Accetta Invito
        </a>
      </div>

      <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 32px 0 0 0;">
        Se non riesci a cliccare il pulsante, copia e incolla questo link nel tuo browser:<br>
        <a href="${inviteLink}" style="color: #3b82f6;">${inviteLink}</a>
      </p>

      <p style="color: #9ca3af; font-size: 14px; margin: 24px 0 0 0;">
        Questo invito scade tra 7 giorni.
      </p>
    </div>

    <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0;">© ${new Date().getFullYear()} FlyFile. Tutti i diritti riservati.</p>
      <p style="margin: 8px 0 0 0;">
        <a href="${BASE_URL}/privacy" style="color: #9ca3af;">Privacy</a> ·
        <a href="${BASE_URL}/terms" style="color: #9ca3af;">Termini</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Sei stato invitato a unirti al team "${teamName}" su FlyFile!

${inviterName} ti ha invitato a collaborare.

Clicca qui per accettare l'invito: ${inviteLink}

Questo invito scade tra 7 giorni.

---
FlyFile - Condivisione file sicura
  `.trim();

  return { html, text };
}

export function getTransferNotificationEmail(params: {
  senderName: string;
  title: string;
  message?: string;
  downloadLink: string;
  fileCount: number;
  totalSize: string;
  expiresAt: string;
}) {
  const { senderName, title, message, downloadLink, fileCount, totalSize, expiresAt } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hai ricevuto dei file - FlyFile</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">FlyFile</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">Condivisione file sicura</p>
    </div>

    <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #1f2937; margin: 0 0 24px 0; font-size: 24px;">Hai ricevuto dei file!</h2>

      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
        <strong>${senderName}</strong> ti ha inviato dei file tramite FlyFile.
      </p>

      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 18px;">${title}</h3>
        ${message ? `<p style="color: #6b7280; margin: 0 0 16px 0; font-style: italic;">"${message}"</p>` : ''}
        <div style="color: #6b7280; font-size: 14px;">
          <span style="margin-right: 16px;">📁 ${fileCount} file</span>
          <span>📦 ${totalSize}</span>
        </div>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${downloadLink}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px;">
          Scarica i File
        </a>
      </div>

      <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 32px 0 0 0;">
        Se non riesci a cliccare il pulsante, copia e incolla questo link nel tuo browser:<br>
        <a href="${downloadLink}" style="color: #3b82f6;">${downloadLink}</a>
      </p>

      <p style="color: #ef4444; font-size: 14px; margin: 24px 0 0 0; background: #fef2f2; padding: 12px; border-radius: 8px;">
        ⚠️ Questo link scade il ${expiresAt}
      </p>
    </div>

    <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0;">© ${new Date().getFullYear()} FlyFile. Tutti i diritti riservati.</p>
      <p style="margin: 8px 0 0 0;">
        <a href="${BASE_URL}/privacy" style="color: #9ca3af;">Privacy</a> ·
        <a href="${BASE_URL}/terms" style="color: #9ca3af;">Termini</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Hai ricevuto dei file da ${senderName}!

${title}
${message ? `Messaggio: "${message}"` : ''}

File: ${fileCount} | Dimensione: ${totalSize}

Scarica i file: ${downloadLink}

⚠️ Questo link scade il ${expiresAt}

---
FlyFile - Condivisione file sicura
  `.trim();

  return { html, text };
}

export function getPasswordResetEmail(params: {
  resetLink: string;
}) {
  const { resetLink } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password - FlyFile</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">FlyFile</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">Condivisione file sicura</p>
    </div>

    <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #1f2937; margin: 0 0 24px 0; font-size: 24px;">Reset Password</h2>

      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
        Hai richiesto di reimpostare la tua password. Clicca il pulsante qui sotto per procedere.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px;">
          Reimposta Password
        </a>
      </div>

      <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 32px 0 0 0;">
        Se non hai richiesto questo reset, puoi ignorare questa email.
      </p>
    </div>

    <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0;">© ${new Date().getFullYear()} FlyFile. Tutti i diritti riservati.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Reset Password - FlyFile

Hai richiesto di reimpostare la tua password.

Clicca qui per reimpostare: ${resetLink}

Se non hai richiesto questo reset, puoi ignorare questa email.

---
FlyFile - Condivisione file sicura
  `.trim();

  return { html, text };
}

// Email verification code for anonymous users
export function getVerificationCodeEmail(params: {
  code: string;
  expiresInMinutes: number;
}) {
  const { code, expiresInMinutes } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Codice di Verifica - FlyFile</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">FlyFile</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">Condivisione file sicura</p>
    </div>

    <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #1f2937; margin: 0 0 24px 0; font-size: 24px; text-align: center;">Codice di Verifica</h2>

      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
        Inserisci questo codice per verificare la tua email e procedere con l'upload:
      </p>

      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: white; font-family: monospace;">
          ${code}
        </span>
      </div>

      <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 24px 0 0 0;">
        Questo codice scade tra <strong>${expiresInMinutes} minuti</strong>.
      </p>

      <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 16px 0 0 0;">
        Se non hai richiesto questo codice, puoi ignorare questa email.
      </p>
    </div>

    <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0;">© ${new Date().getFullYear()} FlyFile. Tutti i diritti riservati.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Codice di Verifica - FlyFile

Inserisci questo codice per verificare la tua email e procedere con l'upload:

${code}

Questo codice scade tra ${expiresInMinutes} minuti.

Se non hai richiesto questo codice, puoi ignorare questa email.

---
FlyFile - Condivisione file sicura
  `.trim();

  return { html, text };
}

// Upload confirmation email to sender
export function getUploadConfirmationEmail(params: {
  senderName: string;
  title: string;
  downloadLink: string;
  fileCount: number;
  totalSize: string;
  expiresAt: string;
  recipientEmail?: string;
}) {
  const { senderName, title, downloadLink, fileCount, totalSize, expiresAt, recipientEmail } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upload Completato - FlyFile</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">FlyFile</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">Condivisione file sicura</p>
    </div>

    <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); border-radius: 50%; line-height: 60px; font-size: 28px;">
          ✓
        </div>
      </div>

      <h2 style="color: #1f2937; margin: 0 0 24px 0; font-size: 24px; text-align: center;">Upload Completato!</h2>

      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
        Ciao <strong>${senderName}</strong>, il tuo trasferimento è stato caricato con successo.
      </p>

      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 18px;">${title}</h3>
        <div style="color: #6b7280; font-size: 14px;">
          <div style="margin-bottom: 8px;">📁 ${fileCount} file</div>
          <div style="margin-bottom: 8px;">📦 ${totalSize}</div>
          ${recipientEmail ? `<div style="margin-bottom: 8px;">📧 Inviato a: ${recipientEmail}</div>` : ''}
        </div>
      </div>

      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
        Ecco il link di download da condividere:
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${downloadLink}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px;">
          Vai al Download
        </a>
      </div>

      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px; margin: 24px 0;">
        <p style="color: #0369a1; font-size: 12px; margin: 0; word-break: break-all;">
          ${downloadLink}
        </p>
      </div>

      <p style="color: #ef4444; font-size: 14px; margin: 24px 0 0 0; background: #fef2f2; padding: 12px; border-radius: 8px;">
        ⏰ Il link scade il ${expiresAt}
      </p>
    </div>

    <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0;">© ${new Date().getFullYear()} FlyFile. Tutti i diritti riservati.</p>
      <p style="margin: 8px 0 0 0;">
        <a href="${BASE_URL}/privacy" style="color: #9ca3af;">Privacy</a> ·
        <a href="${BASE_URL}/terms" style="color: #9ca3af;">Termini</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Upload Completato - FlyFile

Ciao ${senderName}, il tuo trasferimento è stato caricato con successo!

${title}
File: ${fileCount} | Dimensione: ${totalSize}
${recipientEmail ? `Inviato a: ${recipientEmail}` : ''}

Link di download: ${downloadLink}

⏰ Il link scade il ${expiresAt}

---
FlyFile - Condivisione file sicura
  `.trim();

  return { html, text };
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
