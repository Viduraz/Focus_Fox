import { FoxLogo } from './FoxLogo';
import { APP_TAGLINE } from '../../utils/constants';

/**
 * Popup header with FocusFox branding.
 *
 * Features:
 * - Geometric fox logo in a gradient container
 * - Gradient brand text
 * - Ambient glow effect from the top
 * - Subtle separator line
 */
export function Header() {
  return (
    <header className="relative px-5 pt-6 pb-4">
      {/* Ambient top glow */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-fox-500/[0.07] to-transparent pointer-events-none" />

      <div className="relative flex items-center gap-3.5">
        {/* Logo container */}
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-fox-400 to-fox-600 flex items-center justify-center shadow-lg shadow-fox-500/20 ring-1 ring-fox-400/20">
          <FoxLogo className="w-7 h-7" />
        </div>

        {/* Brand text */}
        <div>
          <h1 className="text-[17px] font-extrabold tracking-tight leading-tight">
            <span className="gradient-text-fox">FocusFox</span>
          </h1>
          <p className="text-[11px] text-white/35 font-medium -mt-0.5 tracking-wide">
            {APP_TAGLINE}
          </p>
        </div>
      </div>

      {/* Gradient separator */}
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    </header>
  );
}
