import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendEmail, getContactNotificationEmail } from '@/lib/email';

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}

// POST - Submit contact form
export async function POST(request: NextRequest) {
  try {
    // Strict rate limiting for contact form
    const rateLimitResponse = await checkRateLimit(request, 'api');
    if (rateLimitResponse) return rateLimitResponse;

    const body: ContactFormData = await request.json();
    const { name, email, company, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tutti i campi obbligatori devono essere compilati' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Indirizzo email non valido' },
        { status: 400 }
      );
    }

    // Get client info
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const db = getAdminFirestore();

    // Store message in Firestore
    const docRef = await db.collection('contact_messages').add({
      name,
      email,
      company: company || null,
      subject,
      message,
      ip,
      userAgent,
      status: 'new',
      createdAt: FieldValue.serverTimestamp(),
      readAt: null,
      repliedAt: null,
    });

    // Send email notification to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'support@flyfile.it';
      const emailContent = getContactNotificationEmail({
        name,
        email,
        company,
        subject,
        message,
        ip,
        userAgent,
        messageId: docRef.id,
      });

      await sendEmail({
        to: adminEmail,
        subject: `[FlyFile Contact] ${subject}`,
        html: emailContent.html,
        text: emailContent.text,
      });
    } catch (emailError) {
      // Log error but don't fail the request - message is saved in Firestore
      console.error('Error sending admin notification email:', emailError);
    }

    return NextResponse.json({
      success: true,
      messageId: docRef.id,
      message: 'Messaggio inviato con successo'
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { error: 'Errore nell\'invio del messaggio' },
      { status: 500 }
    );
  }
}
