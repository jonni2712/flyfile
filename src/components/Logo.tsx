/**
 * FlyFile brand logo component.
 *
 * Variants:
 * - `mark`: square logomark only (gradient + white F). Fixed size via `size` prop.
 * - `wordmark`: logomark + "FlyFile" text. Text color follows the `theme` prop:
 *   - `light` (default): dark text for light backgrounds
 *   - `dark`: white text for dark backgrounds
 *
 * The mark itself is rendered as an inline SVG so the gradient ID is unique
 * per instance (avoids collisions when multiple logos appear on the same page).
 */

interface LogoProps {
  variant?: 'mark' | 'wordmark';
  theme?: 'light' | 'dark';
  size?: number;
  className?: string;
}

let gradientCounter = 0;
function nextGradientId() {
  gradientCounter += 1;
  return `flyfile-logo-gradient-${gradientCounter}`;
}

export default function Logo({
  variant = 'wordmark',
  theme = 'light',
  size = 32,
  className = '',
}: LogoProps) {
  const gradientId = nextGradientId();
  const textColor = theme === 'dark' ? '#ffffff' : '#111827';

  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#409cff" />
          <stop offset="100%" stopColor="#7c5cfc" />
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="56" ry="56" fill={`url(#${gradientId})`} />
      <path
        d="M 72 64 L 188 64 L 188 96 L 104 96 L 104 116 L 160 116 L 160 146 L 104 146 L 104 192 L 72 192 Z"
        fill="#ffffff"
      />
    </svg>
  );

  if (variant === 'mark') {
    return <span className={className} aria-label="FlyFile">{mark}</span>;
  }

  return (
    <span
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label="FlyFile"
    >
      {mark}
      <span
        className="font-bold text-2xl tracking-tight leading-none"
        style={{ color: textColor }}
      >
        FlyFile
      </span>
    </span>
  );
}
