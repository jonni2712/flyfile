import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, getDocs, collection, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getDownloadUrl } from '@/lib/r2';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendEmail, getDownloadNotificationEmail } from '@/lib/email';
import { recordDownload } from '@/lib/analytics';
import { triggerWebhooks } from '@/lib/webhooks';
import archiver from 'archiver';
import { Readable, PassThrough } from 'stream';

// Stream wrapper for Response
async function streamToResponse(archive: archiver.Archiver): Promise<ReadableStream<Uint8Array>> {
  const passThrough = new PassThrough();
  archive.pipe(passThrough);

  return new ReadableStream({
    start(controller) {
      passThrough.on('data', (chunk) => {
        controller.enqueue(new Uint8Array(chunk));
      });
      passThrough.on('end', () => {
        controller.close();
      });
      passThrough.on('error', (err) => {
        controller.error(err);
      });
    },
    cancel() {
      archive.abort();
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const rateLimitResponse = await checkRateLimit(request, 'download');
    if (rateLimitResponse) return rateLimitResponse;

    const { id: transferId } = await params;

    if (!transferId) {
      return NextResponse.json(
        { error: 'Transfer ID richiesto' },
        { status: 400 }
      );
    }

    // Get transfer document
    const transferRef = doc(db, 'transfers', transferId);
    const transferSnap = await getDoc(transferRef);

    if (!transferSnap.exists()) {
      return NextResponse.json(
        { error: 'Trasferimento non trovato' },
        { status: 404 }
      );
    }

    const transferData = transferSnap.data();

    // Check if transfer is expired
    const expiresAt = transferData.expiresAt?.toDate?.();
    if (expiresAt && expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Trasferimento scaduto' },
        { status: 410 }
      );
    }

    // Get all files for this transfer
    const filesRef = collection(db, 'transfers', transferId, 'files');
    const filesSnapshot = await getDocs(filesRef);

    if (filesSnapshot.empty) {
      return NextResponse.json(
        { error: 'Nessun file trovato' },
        { status: 404 }
      );
    }

    // Create zip archive
    const archive = archiver('zip', {
      zlib: { level: 5 }, // Compression level (0-9)
    });

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      throw err;
    });

    // Fetch and add each file to the archive
    const filePromises = filesSnapshot.docs.map(async (fileDoc) => {
      const fileData = fileDoc.data();
      const filePath = fileData.path || fileData.storedName;
      const fileName = fileData.originalName || 'file';

      try {
        // Get presigned URL
        const downloadUrl = await getDownloadUrl(filePath);

        // Fetch file content
        const response = await fetch(downloadUrl);
        if (!response.ok) {
          console.error(`Failed to fetch file: ${fileName}`);
          return;
        }

        // Convert response to buffer
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Add to archive
        archive.append(buffer, { name: fileName });
      } catch (err) {
        console.error(`Error adding file ${fileName} to archive:`, err);
      }
    });

    // Wait for all files to be added
    await Promise.all(filePromises);

    // Finalize the archive
    archive.finalize();

    // Create response stream
    const stream = await streamToResponse(archive);

    // Update download count
    await updateDoc(transferRef, {
      downloadCount: increment(1),
    });

    // Calculate new download count
    const newDownloadCount = (transferData.downloadCount || 0) + 1;

    // Record download analytics
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const userAgent = request.headers.get('user-agent');
    const country = request.headers.get('cf-ipcountry') || undefined;

    recordDownload({
      transferId,
      ip,
      userAgent,
      country,
      downloadType: 'zip',
    }).catch(err => console.error('Analytics error:', err));

    // Trigger webhooks for download event
    if (transferData.userId) {
      triggerWebhooks(transferData.userId, 'transfer.downloaded', {
        transferId,
        title: transferData.title || 'Senza titolo',
        downloadCount: newDownloadCount,
        downloadType: 'zip',
        fileCount: filesSnapshot.size,
      }).catch(err => console.error('Webhook error:', err));
    }

    // Send download notification email (fire and forget - don't block response)
    const senderEmail = transferData.senderEmail || transferData.userId;

    if (senderEmail && transferData.notifyOnDownload !== false) {
      // Get sender info if userId exists
      let senderName = transferData.senderName || 'Utente';

      if (transferData.userId) {
        try {
          const userRef = doc(db, 'users', transferData.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            senderName = userData.displayName || userData.email || senderName;

            // Only send notification if user has email notifications enabled
            if (userData.emailNotifications?.downloads === false) {
              console.log('Download notifications disabled for user');
            } else {
              const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
              const { html, text } = getDownloadNotificationEmail({
                senderName,
                title: transferData.title || 'Trasferimento',
                downloadLink: `${baseUrl}/download/${transferData.transferId}`,
                fileCount: transferData.fileCount || filesSnapshot.size,
                downloadCount: newDownloadCount,
              });

              // Send email asynchronously
              sendEmail({
                to: userData.email,
                subject: `I tuoi file sono stati scaricati - ${transferData.title || 'FlyFile'}`,
                html,
                text,
              }).catch(err => console.error('Failed to send download notification:', err));
            }
          }
        } catch (err) {
          console.error('Error fetching user for notification:', err);
        }
      } else if (transferData.senderEmail) {
        // Anonymous user - send to senderEmail
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const { html, text } = getDownloadNotificationEmail({
          senderName,
          title: transferData.title || 'Trasferimento',
          downloadLink: `${baseUrl}/download/${transferData.transferId}`,
          fileCount: transferData.fileCount || filesSnapshot.size,
          downloadCount: newDownloadCount,
        });

        sendEmail({
          to: transferData.senderEmail,
          subject: `I tuoi file sono stati scaricati - ${transferData.title || 'FlyFile'}`,
          html,
          text,
        }).catch(err => console.error('Failed to send download notification:', err));
      }
    }

    // Generate filename
    const zipFileName = `${transferData.title || 'files'}.zip`
      .replace(/[^a-zA-Z0-9._-]/g, '_');

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFileName}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error creating zip download:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione del download' },
      { status: 500 }
    );
  }
}
