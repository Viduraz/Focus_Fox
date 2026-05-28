/**
 * ExamRadarButton — Full-width action button for triggering the Exam Radar panel.
 *
 * Distinct from FeatureCard: this is a CTA button, not a toggle switch.
 * Uses the FocusFox orange accent with a radial scan animation.
 */

interface ExamRadarButtonProps {
  onClick: () => void;
  loading?: boolean;
}

export function ExamRadarButton({ onClick, loading = false }: ExamRadarButtonProps) {
  return (
    <button
      id="focusfox-exam-radar-btn"
      onClick={onClick}
      disabled={loading}
      className={`
        group relative w-full flex items-center gap-4 p-4 rounded-2xl text-left
        bg-gradient-to-r from-fox-500/[0.18] via-fox-600/[0.10] to-fox-500/[0.06]
        border border-fox-500/[0.22]
        hover:border-fox-400/[0.45] hover:from-fox-500/[0.25] hover:via-fox-600/[0.15]
        transition-all duration-300 ease-out
        hover:scale-[1.015] hover:shadow-xl hover:shadow-fox-500/[0.12]
        disabled:opacity-70 disabled:cursor-wait
        focus-visible:ring-2 focus-visible:ring-fox-500/50
        overflow-hidden
      `}
    >
      {/* Animated background pulse (subtle radial) */}
      <span
        className="
          absolute inset-0 rounded-2xl
          bg-[radial-gradient(ellipse_at_left,_rgba(249,115,22,0.06)_0%,_transparent_70%)]
          group-hover:bg-[radial-gradient(ellipse_at_left,_rgba(249,115,22,0.12)_0%,_transparent_70%)]
          transition-all duration-500
          pointer-events-none
        "
      />

      {/* Icon container */}
      <div
        className={`
          relative z-10 w-12 h-12 rounded-xl flex-shrink-0
          bg-fox-500/[0.15] border border-fox-500/[0.2]
          flex items-center justify-center
          transition-transform duration-300
          group-hover:scale-110
          ${loading ? 'animate-pulse' : ''}
        `}
      >
        <span className="text-2xl leading-none" role="img" aria-label="Exam Radar">
          🧠
        </span>
      </div>

      {/* Text content */}
      <div className="relative z-10 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-sm font-bold text-white/95">Exam Radar</h3>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-fox-500/[0.2] text-fox-400 border border-fox-500/[0.25] uppercase tracking-widest">
            New
          </span>
        </div>
        <p className="text-[11px] text-white/45 leading-relaxed truncate">
          {loading ? 'Scanning page…' : 'Detect exams, deadlines & assignments'}
        </p>
      </div>

      {/* Chevron / loading indicator */}
      <div className="relative z-10 flex-shrink-0">
        {loading ? (
          <div className="w-5 h-5 border-2 border-fox-500/30 border-t-fox-500 rounded-full animate-spin" />
        ) : (
          <svg
            className="w-5 h-5 text-fox-500/60 group-hover:text-fox-400 group-hover:translate-x-0.5 transition-all duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </button>
  );
}
