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

// Shared email styles — full-width, no box, dark/light mode safe
const emailStyles = {
  body: 'margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #ffffff; color: #111827;',
  wrapper: 'max-width: 100%; padding: 32px 24px;',
  header: 'padding: 0 0 24px 0; border-bottom: 1px solid #e5e7eb;',
  headerTitle: 'color: #111827; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;',
  headerSubtitle: 'color: #6b7280; margin: 4px 0 0 0; font-size: 12px;',
  content: 'padding: 24px 0 0 0;',
  title: 'color: #111827; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;',
  text: 'color: #374151; line-height: 1.7; margin: 0 0 16px 0; font-size: 15px;',
  btnPrimary: 'display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 9999px; font-weight: 600; font-size: 14px;',
  btnBlue: 'display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 9999px; font-weight: 600; font-size: 14px;',
  btnSecondary: 'display: inline-block; background-color: #f3f4f6; color: #374151; text-decoration: none; padding: 12px 32px; border-radius: 9999px; font-weight: 600; font-size: 13px; border: 1px solid #e5e7eb;',
  infoBox: 'background: #f9fafb; border-radius: 10px; padding: 16px; margin: 20px 0;',
  warningBox: 'background: #fef2f2; border-radius: 10px; padding: 12px 16px; margin: 20px 0;',
  warningText: 'color: #dc2626; font-size: 13px; margin: 0; font-weight: 500;',
  muted: 'color: #6b7280; font-size: 13px; line-height: 1.6;',
  link: 'color: #3b82f6; text-decoration: none;',
  footer: 'text-align: center; padding: 24px 0 0 0; margin-top: 24px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 11px;',
  footerLink: 'color: #9ca3af; text-decoration: none;',
  divider: 'height: 1px; background-color: #e5e7eb; margin: 24px 0; border: none;',
};

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
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Invito al Team - FlyFile</title>
</head>
<body style="${emailStyles.body}">
  <div style="${emailStyles.wrapper}">
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.headerTitle}">FlyFile</h1>
    </div>

    <div style="${emailStyles.content}">
      <h2 style="${emailStyles.title}">Sei stato invitato!</h2>

      <p style="${emailStyles.text}">
        <strong>${inviterName}</strong> ti ha invitato a unirti al team <strong>"${teamName}"</strong> su FlyFile.
      </p>

      <p style="${emailStyles.text}">
        Clicca il pulsante qui sotto per accettare l'invito e iniziare a collaborare con il tuo team.
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${inviteLink}" style="${emailStyles.btnPrimary}">
          Accetta Invito
        </a>
      </div>

      <p style="${emailStyles.muted}; margin-top: 28px;">
        Se non riesci a cliccare il pulsante, copia e incolla questo link nel tuo browser:<br>
        <a href="${inviteLink}" style="${emailStyles.link}">${inviteLink}</a>
      </p>

      <p style="${emailStyles.muted}; margin-top: 12px;">
        Questo invito scade tra 7 giorni.
      </p>
    </div>

    <div style="${emailStyles.footer}">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} FlyFile. Tutti i diritti riservati.</p>
      <p style="margin: 8px 0 0 0;">
        <a href="${BASE_URL}/privacy" style="${emailStyles.footerLink}">Privacy</a> &middot;
        <a href="${BASE_URL}/termini" style="${emailStyles.footerLink}">Termini</a>
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
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Hai ricevuto dei file - FlyFile</title>
</head>
<body style="${emailStyles.body}">
  <div style="${emailStyles.wrapper}">
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.headerTitle}">FlyFile</h1>
    </div>

    <div style="${emailStyles.content}">
      <h2 style="${emailStyles.title}">Hai ricevuto dei file!</h2>

      <p style="${emailStyles.text}">
        <strong>${senderName}</strong> ti ha inviato dei file tramite FlyFile.
      </p>

      <div style="${emailStyles.infoBox}">
        <h3 style="color: #111827; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">${title}</h3>
        ${message ? `<p style="color: #6b7280; margin: 0 0 12px 0; font-style: italic; font-size: 14px;">"${message}"</p>` : ''}
        <div style="color: #6b7280; font-size: 13px;">
          <span style="margin-right: 16px;">${fileCount} file</span>
          <span>${totalSize}</span>
        </div>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${downloadLink}" style="${emailStyles.btnBlue}">
          Scarica i File
        </a>
      </div>

      <p style="${emailStyles.muted}; margin-top: 32px;">
        Se non riesci a cliccare il pulsante, copia e incolla questo link nel tuo browser:<br>
        <a href="${downloadLink}" style="${emailStyles.link}">${downloadLink}</a>
      </p>

      <div style="${emailStyles.warningBox}">
        <p style="${emailStyles.warningText}">Questo link scade il ${expiresAt}</p>
      </div>
    </div>

    <div style="${emailStyles.footer}">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} FlyFile. Tutti i diritti riservati.</p>
      <p style="margin: 8px 0 0 0;">
        <a href="${BASE_URL}/privacy" style="${emailStyles.footerLink}">Privacy</a> &middot;
        <a href="${BASE_URL}/termini" style="${emailStyles.footerLink}">Termini</a>
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

Questo link scade il ${expiresAt}

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
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Reset Password - FlyFile</title>
</head>
<body style="${emailStyles.body}">
  <div style="${emailStyles.wrapper}">
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.headerTitle}">FlyFile</h1>
    </div>

    <div style="${emailStyles.content}">
      <h2 style="${emailStyles.title}">Reset Password</h2>

      <p style="${emailStyles.text}">
        Hai richiesto di reimpostare la tua password. Clicca il pulsante qui sotto per procedere.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetLink}" style="${emailStyles.btnPrimary}">
          Reimposta Password
        </a>
      </div>

      <p style="${emailStyles.muted}; margin-top: 32px;">
        Se non hai richiesto questo reset, puoi ignorare questa email.
      </p>
    </div>

    <div style="${emailStyles.footer}">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} FlyFile. Tutti i diritti riservati.</p>
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

// Password setup email
export function getPasswordSetupEmail(params: {
  resetLink: string;
}) {
  const { resetLink } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Configura la tua password - FlyFile</title>
</head>
<body style="${emailStyles.body}">
  <div style="${emailStyles.wrapper}">
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.headerTitle}">FlyFile</h1>
    </div>

    <div style="${emailStyles.content}">
      <h2 style="${emailStyles.title}">Configura la tua password</h2>

      <p style="${emailStyles.text}">
        Clicca il pulsante qui sotto per configurare la tua password. Questo ti permetterà di accedere al tuo account FlyFile anche tramite email e password.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetLink}" style="${emailStyles.btnPrimary}">
          Configura Password
        </a>
      </div>

      <p style="${emailStyles.muted}; margin-top: 32px;">
        Se non hai richiesto questa email, puoi ignorarla in sicurezza.
      </p>

      <p style="${emailStyles.muted}; margin-top: 12px;">
        Se non riesci a cliccare il pulsante, copia e incolla questo link nel tuo browser:<br>
        <a href="${resetLink}" style="${emailStyles.link}">${resetLink}</a>
      </p>
    </div>

    <div style="${emailStyles.footer}">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} FlyFile. Tutti i diritti riservati.</p>
      <p style="margin: 8px 0 0 0;">
        <a href="${BASE_URL}/privacy" style="${emailStyles.footerLink}">Privacy</a> &middot;
        <a href="${BASE_URL}/termini" style="${emailStyles.footerLink}">Termini</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Configura la tua password - FlyFile

Clicca qui per configurare la tua password: ${resetLink}

Se non hai richiesto questa email, puoi ignorarla in sicurezza.

---
FlyFile - Condivisione file sicura
  `.trim();

  return { html, text };
}

// Auth code email for passwordless login/register
export function getAuthCodeEmail(params: {
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
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Il tuo codice di accesso - FlyFile</title>
</head>
<body style="${emailStyles.body}">
  <div style="${emailStyles.wrapper}">
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.headerTitle}">FlyFile</h1>
    </div>

    <div style="${emailStyles.content}">
      <h2 style="${emailStyles.title}; text-align: center;">Il tuo codice di accesso</h2>

      <p style="${emailStyles.text}; text-align: center;">
        Inserisci questo codice per accedere al tuo account FlyFile:
      </p>

      <div style="background-color: #f3f4f6; border-radius: 10px; padding: 24px; margin: 20px 0; text-align: center;">
        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827; font-family: 'SF Mono', SFMono-Regular, Consolas, monospace;">
          ${code}
        </span>
      </div>

      <p style="${emailStyles.muted}; text-align: center; margin-top: 20px;">
        Questo codice scade tra <strong>${expiresInMinutes} minuti</strong>.
      </p>

      <p style="${emailStyles.muted}; text-align: center; margin-top: 12px;">
        Se non hai richiesto questo codice, puoi ignorare questa email.
      </p>
    </div>

    <div style="${emailStyles.footer}">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} FlyFile. Tutti i diritti riservati.</p>
      <p style="margin: 8px 0 0 0;">
        <a href="${BASE_URL}/privacy" style="${emailStyles.footerLink}">Privacy</a> &middot;
        <a href="${BASE_URL}/termini" style="${emailStyles.footerLink}">Termini</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Il tuo codice di accesso - FlyFile

Inserisci questo codice per accedere al tuo account FlyFile:

${code}

Questo codice scade tra ${expiresInMinutes} minuti.

Se non hai richiesto questo codice, puoi ignorare questa email.

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
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Codice di Verifica - FlyFile</title>
</head>
<body style="${emailStyles.body}">
  <div style="${emailStyles.wrapper}">
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.headerTitle}">FlyFile</h1>
    </div>

    <div style="${emailStyles.content}">
      <h2 style="${emailStyles.title}; text-align: center;">Codice di Verifica</h2>

      <p style="${emailStyles.text}; text-align: center;">
        Inserisci questo codice per verificare la tua email e procedere con l'upload:
      </p>

      <div style="background-color: #f3f4f6; border-radius: 10px; padding: 24px; margin: 20px 0; text-align: center;">
        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827; font-family: 'SF Mono', SFMono-Regular, Consolas, monospace;">
          ${code}
        </span>
      </div>

      <p style="${emailStyles.muted}; text-align: center; margin-top: 20px;">
        Questo codice scade tra <strong>${expiresInMinutes} minuti</strong>.
      </p>

      <p style="${emailStyles.muted}; text-align: center; margin-top: 12px;">
        Se non hai richiesto questo codice, puoi ignorare questa email.
      </p>
    </div>

    <div style="${emailStyles.footer}">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} FlyFile. Tutti i diritti riservati.</p>
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
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Upload Completato - FlyFile</title>
</head>
<body style="${emailStyles.body}">
  <div style="${emailStyles.wrapper}">
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.headerTitle}">FlyFile</h1>
    </div>

    <div style="${emailStyles.content}">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 48px; height: 48px; background-color: #ecfdf5; border: 2px solid #a7f3d0; border-radius: 50%; line-height: 48px; font-size: 20px; color: #059669;">
          &#10003;
        </div>
      </div>

      <h2 style="${emailStyles.title}; text-align: center;">Upload Completato!</h2>

      <p style="${emailStyles.text}">
        Ciao <strong>${senderName}</strong>, il tuo trasferimento è stato caricato con successo.
      </p>

      <div style="${emailStyles.infoBox}">
        <h3 style="color: #111827; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">${title}</h3>
        <div style="color: #6b7280; font-size: 13px;">
          <div style="margin-bottom: 6px;">${fileCount} file</div>
          <div style="margin-bottom: 6px;">${totalSize}</div>
          ${recipientEmail ? `<div style="margin-bottom: 6px;">Inviato a: ${recipientEmail}</div>` : ''}
        </div>
      </div>

      <p style="${emailStyles.text}">
        Ecco il link di download da condividere:
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${downloadLink}" style="${emailStyles.btnBlue}">
          Vai al Download
        </a>
      </div>

      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin: 24px 0;">
        <p style="color: #6b7280; font-size: 12px; margin: 0; word-break: break-all;">
          ${downloadLink}
        </p>
      </div>

      <div style="${emailStyles.warningBox}">
        <p style="${emailStyles.warningText}">Il link scade il ${expiresAt}</p>
      </div>
    </div>

    <div style="${emailStyles.footer}">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} FlyFile. Tutti i diritti riservati.</p>
      <p style="margin: 8px 0 0 0;">
        <a href="${BASE_URL}/privacy" style="${emailStyles.footerLink}">Privacy</a> &middot;
        <a href="${BASE_URL}/termini" style="${emailStyles.footerLink}">Termini</a>
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

Il link scade il ${expiresAt}

---
FlyFile - Condivisione file sicura
  `.trim();

  return { html, text };
}

// Download notification email to sender
export function getDownloadNotificationEmail(params: {
  senderName: string;
  title: string;
  downloadLink: string;
  fileCount: number;
  downloadCount: number;
  recipientInfo?: string;
}) {
  const { senderName, title, downloadLink, fileCount, downloadCount, recipientInfo } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>I tuoi file sono stati scaricati - FlyFile</title>
</head>
<body style="${emailStyles.body}">
  <div style="${emailStyles.wrapper}">
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.headerTitle}">FlyFile</h1>
    </div>

    <div style="${emailStyles.content}">
      <h2 style="${emailStyles.title}; text-align: center;">I tuoi file sono stati scaricati!</h2>

      <p style="${emailStyles.text}">
        Ciao <strong>${senderName}</strong>, qualcuno ha scaricato i tuoi file.
      </p>

      <div style="${emailStyles.infoBox}">
        <h3 style="color: #111827; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">${title}</h3>
        <div style="color: #6b7280; font-size: 13px;">
          <div style="margin-bottom: 6px;">${fileCount} file</div>
          <div style="margin-bottom: 6px;">Download totali: <strong>${downloadCount}</strong></div>
          ${recipientInfo ? `<div style="margin-bottom: 6px;">Scaricato da: ${recipientInfo}</div>` : ''}
        </div>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${downloadLink}" style="${emailStyles.btnSecondary}">
          Visualizza Trasferimento
        </a>
      </div>
    </div>

    <div style="${emailStyles.footer}">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} FlyFile. Tutti i diritti riservati.</p>
      <p style="margin: 8px 0 0 0;">
        <a href="${BASE_URL}/privacy" style="${emailStyles.footerLink}">Privacy</a> &middot;
        <a href="${BASE_URL}/termini" style="${emailStyles.footerLink}">Termini</a>
      </p>
      <p style="margin: 8px 0 0 0;">
        <a href="${BASE_URL}/settings/notifications" style="${emailStyles.footerLink}">Gestisci notifiche</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
I tuoi file sono stati scaricati - FlyFile

Ciao ${senderName}, qualcuno ha scaricato i tuoi file!

${title}
File: ${fileCount}
Download totali: ${downloadCount}
${recipientInfo ? `Scaricato da: ${recipientInfo}` : ''}

Visualizza trasferimento: ${downloadLink}

---
FlyFile - Condivisione file sicura
  `.trim();

  return { html, text };
}

// Contact form notification to admin
export function getContactNotificationEmail(params: {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  ip: string;
  userAgent: string;
  messageId: string;
}) {
  const { name, email, company, subject, message, ip, userAgent, messageId } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Nuovo Messaggio di Contatto - FlyFile</title>
</head>
<body style="${emailStyles.body}">
  <div style="${emailStyles.wrapper}">
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.headerTitle}">FlyFile</h1>
    </div>

    <div style="${emailStyles.content}">
      <h2 style="${emailStyles.title}">${subject}</h2>

      <div style="${emailStyles.infoBox}">
        <h3 style="color: #6b7280; margin: 0 0 14px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Informazioni Mittente</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #6b7280; padding: 4px 0; width: 80px; font-size: 13px;">Nome:</td>
            <td style="color: #111827; padding: 4px 0; font-weight: 600; font-size: 13px;">${name}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 4px 0; font-size: 13px;">Email:</td>
            <td style="color: #111827; padding: 4px 0; font-size: 13px;"><a href="mailto:${email}" style="${emailStyles.link}">${email}</a></td>
          </tr>
          ${company ? `
          <tr>
            <td style="color: #6b7280; padding: 4px 0; font-size: 13px;">Azienda:</td>
            <td style="color: #111827; padding: 4px 0; font-size: 13px;">${company}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin: 0 0 24px 0;">
        <h3 style="color: #6b7280; margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Messaggio</h3>
        <p style="color: #111827; line-height: 1.7; margin: 0; white-space: pre-wrap; font-size: 14px;">${message}</p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="${emailStyles.btnPrimary}">
          Rispondi
        </a>
      </div>

      <hr style="${emailStyles.divider}">

      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
        <p style="color: #9ca3af; font-size: 11px; margin: 0; line-height: 1.6;">
          <strong>ID:</strong> ${messageId}<br>
          <strong>IP:</strong> ${ip}<br>
          <strong>UA:</strong> ${userAgent}
        </p>
      </div>
    </div>

    <div style="${emailStyles.footer}">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} FlyFile. Tutti i diritti riservati.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Nuovo Messaggio di Contatto - FlyFile

Oggetto: ${subject}

MITTENTE
Nome: ${name}
Email: ${email}
${company ? `Azienda: ${company}` : ''}

MESSAGGIO
${message}

---
ID: ${messageId}
IP: ${ip}
User Agent: ${userAgent}
  `.trim();

  return { html, text };
}

// Beta tester welcome email
export function getBetaTesterWelcomeEmail(params: {
  userName: string;
  couponCode: string;
}) {
  const { userName, couponCode } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Benvenuto nel Programma Beta - FlyFile</title>
</head>
<body style="${emailStyles.body}">
  <div style="${emailStyles.wrapper}">
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.headerTitle}">FlyFile</h1>
    </div>

    <div style="${emailStyles.content}">
      <h2 style="${emailStyles.title}">Ciao ${userName}!</h2>

      <p style="${emailStyles.text}">
        Grazie per esserti unito al nostro esclusivo programma beta! Sei tra i primi a provare FlyFile e il tuo feedback sarà fondamentale per migliorare il servizio.
      </p>

      <div style="background-color: #f3f4f6; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Il tuo codice beta</p>
        <span style="font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #111827; font-family: 'SF Mono', SFMono-Regular, Consolas, monospace;">
          ${couponCode}
        </span>
      </div>

      <h3 style="color: #111827; margin: 24px 0 12px 0; font-size: 16px; font-weight: 600;">Vantaggi del Programma Beta:</h3>
      <ul style="color: #4b5563; line-height: 2; padding-left: 20px; margin: 0; font-size: 14px;">
        <li>Sconto esclusivo del 50% per sempre</li>
        <li>Accesso anticipato alle nuove funzionalità</li>
        <li>Supporto prioritario</li>
        <li>Badge "Beta Tester" sul tuo profilo</li>
        <li>Canale Discord esclusivo per feedback</li>
      </ul>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${BASE_URL}/upload" style="${emailStyles.btnPrimary}">
          Vai a FlyFile
        </a>
      </div>

      <p style="${emailStyles.muted}; margin-top: 24px;">
        Hai domande o feedback? Rispondi direttamente a questa email!
      </p>
    </div>

    <div style="${emailStyles.footer}">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} FlyFile. Tutti i diritti riservati.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Benvenuto nel Programma Beta - FlyFile

Ciao ${userName}!

Grazie per esserti unito al nostro esclusivo programma beta!

Il tuo codice beta: ${couponCode}

Vantaggi del Programma Beta:
- Sconto esclusivo del 50% per sempre
- Accesso anticipato alle nuove funzionalità
- Supporto prioritario
- Badge "Beta Tester" sul tuo profilo
- Canale Discord esclusivo per feedback

Vai a FlyFile: ${BASE_URL}/upload

Hai domande o feedback? Rispondi direttamente a questa email!

---
FlyFile - Condivisione file sicura
  `.trim();

  return { html, text };
}

// Subscription confirmation email
export function getSubscriptionConfirmationEmail(params: {
  userName: string;
  planName: string;
  billingCycle: 'monthly' | 'annual';
  billingUrl: string;
}) {
  const { userName, planName, billingCycle, billingUrl } = params;
  const cycleLabel = billingCycle === 'annual' ? 'annuale' : 'mensile';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Abbonamento Attivato - FlyFile</title>
</head>
<body style="${emailStyles.body}">
  <div style="${emailStyles.wrapper}">
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.headerTitle}">FlyFile</h1>
    </div>

    <div style="${emailStyles.content}">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 48px; height: 48px; background-color: #eff6ff; border: 2px solid #93c5fd; border-radius: 50%; line-height: 48px; font-size: 20px; color: #2563eb;">
          &#10003;
        </div>
      </div>

      <h2 style="${emailStyles.title}; text-align: center;">Abbonamento Attivato!</h2>

      <p style="${emailStyles.text}">
        Ciao <strong>${userName}</strong>, il tuo abbonamento FlyFile è stato attivato con successo.
      </p>

      <div style="${emailStyles.infoBox}">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #6b7280; padding: 6px 0; font-size: 13px;">Piano:</td>
            <td style="color: #111827; padding: 6px 0; font-weight: 600; font-size: 13px; text-align: right;">${planName}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 6px 0; font-size: 13px;">Fatturazione:</td>
            <td style="color: #111827; padding: 6px 0; font-weight: 600; font-size: 13px; text-align: right;">${cycleLabel.charAt(0).toUpperCase() + cycleLabel.slice(1)}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 6px 0; font-size: 13px;">Stato:</td>
            <td style="color: #059669; padding: 6px 0; font-weight: 600; font-size: 13px; text-align: right;">Attivo</td>
          </tr>
        </table>
      </div>

      <p style="${emailStyles.text}">
        Puoi iniziare subito a utilizzare tutte le funzionalità incluse nel tuo piano. La ricevuta di pagamento ti verrà inviata separatamente da Stripe.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${BASE_URL}/upload" style="${emailStyles.btnBlue}">
          Inizia a Caricare
        </a>
      </div>

      <div style="text-align: center; margin: 16px 0;">
        <a href="${billingUrl}" style="${emailStyles.btnSecondary}">
          Gestisci Abbonamento
        </a>
      </div>

      <p style="${emailStyles.muted}; margin-top: 28px; text-align: center;">
        Hai bisogno di aiuto? <a href="${BASE_URL}/contatti" style="${emailStyles.link}">Contattaci</a>
      </p>
    </div>

    <div style="${emailStyles.footer}">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} FlyFile. Tutti i diritti riservati.</p>
      <p style="margin: 8px 0 0 0;">
        <a href="${BASE_URL}/privacy" style="${emailStyles.footerLink}">Privacy</a> &middot;
        <a href="${BASE_URL}/termini" style="${emailStyles.footerLink}">Termini</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Abbonamento Attivato - FlyFile

Ciao ${userName}, il tuo abbonamento FlyFile è stato attivato con successo!

Piano: ${planName}
Fatturazione: ${cycleLabel}
Stato: Attivo

Puoi iniziare subito a utilizzare tutte le funzionalità incluse nel tuo piano.

Inizia a caricare: ${BASE_URL}/upload
Gestisci abbonamento: ${billingUrl}

Hai bisogno di aiuto? Contattaci: ${BASE_URL}/contatti

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
