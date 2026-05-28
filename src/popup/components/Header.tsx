import { FoxLogo } from './FoxLogo';
import { APP_TAGLINE } from '../../utils/constants';
import { Settings, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  onToggleSettings?: () => void;
  isSettingsView?: boolean;
}

/**
 * Popup header with FocusFox branding and settings toggles.
 */
export function Header({ onToggleSettings, isSettingsView = false }: HeaderProps) {
  return (
    <header className="relative px-5 pt-6 pb-4">
      {/* Ambient top glow */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-fox-500/[0.07] to-transparent pointer-events-none" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3.5">
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

        {/* Action Button (Settings / Back) */}
        {onToggleSettings && (
          <button
            onClick={onToggleSettings}
            className="
              w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08]
              flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.08]
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fox-500/50
            "
            title={isSettingsView ? 'Go back' : 'Radar settings'}
          >
            {isSettingsView ? (
              <ArrowLeft className="w-4.5 h-4.5" />
            ) : (
              <Settings className="w-4.5 h-4.5" />
            )}
          </button>
        )}
      </div>

      {/* Gradient separator */}
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    </header>
  );
}
