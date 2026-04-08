import { ImageResponse } from 'next/og';

// Apple Touch Icon — rendered as PNG at build time via Next.js ImageResponse.
// iOS applies its own rounded-corner mask to the icon, but we still render
// rounded corners for Android/PWA home screens that use this file.

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #409cff 0%, #7c5cfc 100%)',
        }}
      >
        <svg
          width="130"
          height="130"
          viewBox="0 0 256 256"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 72 64 L 188 64 L 188 96 L 104 96 L 104 116 L 160 116 L 160 146 L 104 146 L 104 192 L 72 192 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
