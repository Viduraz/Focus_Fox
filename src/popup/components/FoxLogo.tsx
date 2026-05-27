/**
 * Minimal geometric fox logo as an inline SVG.
 *
 * Designed to render cleanly at small sizes (16–48px).
 * Uses warm orange gradients consistent with the FocusFox brand palette.
 */

interface FoxLogoProps {
  className?: string;
}

export function FoxLogo({ className = '' }: FoxLogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="FocusFox logo"
    >
      {/* Left ear */}
      <path d="M6 3L11 13L4 11L6 3Z" fill="#FDBA74" />
      {/* Right ear */}
      <path d="M26 3L21 13L28 11L26 3Z" fill="#FDBA74" />

      {/* Inner ear accents */}
      <path d="M7.5 5L11 12L5.5 10L7.5 5Z" fill="#FED7AA" opacity="0.5" />
      <path d="M24.5 5L21 12L26.5 10L24.5 5Z" fill="#FED7AA" opacity="0.5" />

      {/* Head */}
      <path
        d="M8 11C8 11 10 7 16 7C22 7 24 11 24 11L22 24H10L8 11Z"
        fill="url(#foxHead)"
      />

      {/* Face / muzzle */}
      <path d="M12 16L16 24L20 16L18.5 14H13.5L12 16Z" fill="#FFF7ED" />

      {/* Eyes */}
      <circle cx="13" cy="15" r="1.5" fill="#1E293B" />
      <circle cx="19" cy="15" r="1.5" fill="#1E293B" />

      {/* Eye highlights */}
      <circle cx="13.5" cy="14.3" r="0.6" fill="white" opacity="0.85" />
      <circle cx="19.5" cy="14.3" r="0.6" fill="white" opacity="0.85" />

      {/* Nose */}
      <ellipse cx="16" cy="19" rx="1.5" ry="1" fill="#7C2D12" />

      <defs>
        <linearGradient id="foxHead" x1="16" y1="7" x2="16" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FB923C" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
      </defs>
    </svg>
  );
}
