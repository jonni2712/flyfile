import { getAdminFirestore } from './firebase-admin';
import { sendEmail, getDownloadNotificationEmail } from './email';

/**
 * Sends a "your files were downloaded" email to the sender — but only
 * the first time. Uses a Firestore transaction on the transfer doc to
 * atomically flip a `firstDownloadNotified` flag, preventing duplicate
 * emails on parallel downloads.
 *
 * Fire-and-forget — never throws. Logs errors to console.
 *
 * Honors `users/{uid}.notificationPrefs.firstDownload` if present
 * (defaults to ON when undefined).
 */
export async function notifyFirstDownload(transferId: string): Promise<void> {
  try {
    const db = getAdminFirestore();
    const transferRef = db.collection('transfers').doc(transferId);

    // Atomically check & set the notified flag
    const wasFirst = await db.runTransaction(async (tx) => {
      const snap = await tx.get(transferRef);
      if (!snap.exists) return false;
      const data = snap.data() || {};
      if (data.firstDownloadNotified === true) return false;
      tx.update(transferRef, { firstDownloadNotified: true });
      return true;
    });

    if (!wasFirst) return;

    // Reload the transfer (outside transaction) to get sender info
    const snap = await transferRef.get();
    const transfer = snap.data() || {};

    // Resolve sender email — registered users override the senderEmail field
    let senderEmail: string | undefined = transfer.senderEmail;
    let senderName: string = transfer.senderName || 'Utente';
    let preferDisabled = false;

    if (transfer.userId) {
      const userSnap = await db.collection('users').doc(transfer.userId).get();
      const userData = userSnap.data() || {};
      senderEmail = userData.email || senderEmail;
      senderName = userData.displayName || senderName;
      // Per-user opt-out: notificationPrefs.firstDownload === false disables
      if (userData?.notificationPrefs?.firstDownload === false) {
        preferDisabled = true;
      }
    }

    if (preferDisabled || !senderEmail) return;

    // Build download link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://flyfile.it';
    const downloadLink = `${baseUrl}/scarica/${transferId}`;

    const fileCount = Array.isArray(transfer.files) ? transfer.files.length : 0;

    const { html, text } = getDownloadNotificationEmail({
      senderName,
      title: transfer.title || 'Trasferimento',
      downloadLink,
      fileCount,
      downloadCount: 1,
    });

    await sendEmail({
      to: senderEmail,
      subject: `I tuoi file sono stati scaricati - FlyFile`,
      html,
      text,
    });
  } catch (err) {
    console.error('[notify-first-download] failed:', err);
  }
}
