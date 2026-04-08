import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'FlyFile';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const taglines: Record<string, string> = {
  it: 'Invia File Online — Sicuro e Gratuito',
  en: 'Send Files Online — Secure & Free',
  de: 'Dateien Online Senden — Sicher & Kostenlos',
  fr: 'Envoyez des Fichiers en Ligne — Sécurisé et Gratuit',
  es: 'Envía Archivos en Línea — Seguro y Gratis',
};

const features: Record<string, string[]> = {
  it: ['Crittografia AES-256', 'Fino a 5GB gratis', 'Senza registrazione'],
  en: ['AES-256 Encryption', 'Up to 5GB free', 'No registration'],
  de: ['AES-256-Verschlüsselung', 'Bis zu 5GB kostenlos', 'Ohne Registrierung'],
  fr: ['Chiffrement AES-256', "Jusqu'à 5Go gratuit", 'Sans inscription'],
  es: ['Cifrado AES-256', 'Hasta 5GB gratis', 'Sin registro'],
};

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tagline = taglines[locale] || taglines.it;
  const featureList = features[locale] || features.it;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #409cff 0%, #5b7efc 50%, #7c5cfc 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative orbs */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            left: -120,
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.10)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -160,
            right: -160,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px',
          }}
        >
          {/* Logo mark — white rounded square with white F (inverted from app icon for contrast on the gradient bg) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 140,
              height: 140,
              borderRadius: 32,
              background: 'rgba(255,255,255,0.18)',
              border: '2px solid rgba(255,255,255,0.35)',
              backdropFilter: 'blur(10px)',
              marginBottom: 28,
            }}
          >
            <svg
              width="84"
              height="84"
              viewBox="0 0 256 256"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 72 64 L 188 64 L 188 96 L 104 96 L 104 116 L 160 116 L 160 146 L 104 146 L 104 192 L 72 192 Z"
                fill="#ffffff"
              />
            </svg>
          </div>

          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              color: 'white',
              lineHeight: 1,
              marginBottom: 18,
              letterSpacing: -2,
            }}
          >
            FlyFile
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.92)',
              lineHeight: 1.4,
              maxWidth: 760,
            }}
          >
            {tagline}
          </div>
          <div
            style={{
              marginTop: 36,
              fontSize: 19,
              color: 'rgba(255,255,255,0.78)',
              display: 'flex',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <span>{featureList[0]}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
            <span>{featureList[1]}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
            <span>{featureList[2]}</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
