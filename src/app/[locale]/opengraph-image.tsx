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

export default async function Image({ params }: { params: { locale: string } }) {
  const locale = params.locale || 'it';
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
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -60,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            right: -80,
            width: 400,
            height: 400,
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
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            FlyFile
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.9)',
              lineHeight: 1.4,
              maxWidth: 700,
            }}
          >
            {tagline}
          </div>
          <div
            style={{
              marginTop: 32,
              fontSize: 18,
              color: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span>{featureList[0]}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
            <span>{featureList[1]}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
            <span>{featureList[2]}</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
