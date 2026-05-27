import type { FeatureCardConfig } from '../../utils/types';

interface FeatureCardProps extends FeatureCardConfig {
  onClick: () => void;
}

/**
 * Color mapping for each feature card accent.
 * Uses Tailwind's opacity modifier syntax for subtle gradients.
 */
const colorMap = {
  fox: {
    gradient: 'from-fox-500/[0.12] to-fox-600/[0.03]',
    border: 'border-fox-500/[0.15]',
    hoverBorder: 'hover:enabled:border-fox-400/[0.35]',
    glow: 'hover:enabled:shadow-fox-500/[0.08]',
    iconBg: 'bg-fox-500/[0.1]',
  },
  purple: {
    gradient: 'from-purple-500/[0.12] to-purple-600/[0.03]',
    border: 'border-purple-500/[0.15]',
    hoverBorder: 'hover:enabled:border-purple-400/[0.35]',
    glow: 'hover:enabled:shadow-purple-500/[0.08]',
    iconBg: 'bg-purple-500/[0.1]',
  },
  blue: {
    gradient: 'from-blue-500/[0.12] to-blue-600/[0.03]',
    border: 'border-blue-500/[0.15]',
    hoverBorder: 'hover:enabled:border-blue-400/[0.35]',
    glow: 'hover:enabled:shadow-blue-500/[0.08]',
    iconBg: 'bg-blue-500/[0.1]',
  },
  green: {
    gradient: 'from-emerald-500/[0.12] to-emerald-600/[0.03]',
    border: 'border-emerald-500/[0.15]',
    hoverBorder: 'hover:enabled:border-emerald-400/[0.35]',
    glow: 'hover:enabled:shadow-emerald-500/[0.08]',
    iconBg: 'bg-emerald-500/[0.1]',
  },
} as const;

/**
 * Feature card component for the popup grid.
 *
 * Each card represents a planned feature with:
 * - Colored gradient background
 * - Icon in a tinted container
 * - "Soon" badge when disabled
 * - Hover scale + glow animation (only when enabled)
 */
export function FeatureCard({
  icon,
  title,
  description,
  color,
  enabled,
  onClick,
}: FeatureCardProps) {
  const c = colorMap[color];

  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={`
        group relative flex flex-col items-start p-4 rounded-2xl text-left w-full
        bg-gradient-to-br ${c.gradient}
        border ${c.border} ${c.hoverBorder}
        transition-all duration-300 ease-out
        hover:enabled:scale-[1.03] hover:enabled:shadow-xl ${c.glow}
        disabled:opacity-80 disabled:cursor-default
        focus-visible:ring-2 focus-visible:ring-fox-500/50
      `}
    >
      {/* Icon */}
      <div
        className={`
          w-10 h-10 rounded-xl ${c.iconBg}
          flex items-center justify-center mb-3
          transition-transform duration-300
          group-hover:group-enabled:scale-110
        `}
      >
        <span className="text-xl leading-none">{icon}</span>
      </div>

      {/* Content */}
      <h3 className="text-sm font-semibold text-white/90 mb-0.5">{title}</h3>
      <p className="text-[11px] text-white/40 leading-relaxed">{description}</p>

      {/* Coming Soon badge */}
      {!enabled && (
        <span className="absolute top-3 right-3 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.05] text-white/30 border border-white/[0.05] uppercase tracking-widest">
          Soon
        </span>
      )}
    </button>
  );
}
