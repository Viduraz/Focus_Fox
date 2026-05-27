import { APP_VERSION } from '../../utils/constants';

/**
 * Status section displayed at the bottom of the popup.
 *
 * Shows:
 * - Extension active indicator (animated green dot)
 * - Current version number
 * - Phase 1 footer note
 */
export function StatusSection() {
  return (
    <section className="mt-1">
      {/* Status bar */}
      <div className="p-3.5 rounded-2xl bg-dark-900/60 border border-white/[0.05]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Animated active indicator */}
            <div className="relative flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
            </div>
            <span className="text-xs font-medium text-white/50">
              Extension Active
            </span>
          </div>
          <span className="text-[10px] font-mono text-white/25 tracking-wide">
            v{APP_VERSION}
          </span>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] text-white/20 mt-3.5 font-medium tracking-wide">
        Built for students · Phase 1
      </p>
    </section>
  );
}
