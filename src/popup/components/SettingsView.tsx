import { ExtensionSettings, RadarCategory } from '../../utils/types';
import { 
  GraduationCap, 
  HelpCircle, 
  BookOpen, 
  Clock, 
  UploadCloud, 
  Award, 
  Bell, 
  Sliders, 
  Eye, 
  Check 
} from 'lucide-react';

interface SettingsViewProps {
  settings: ExtensionSettings;
  onUpdateRadarSettings: (updates: Partial<ExtensionSettings['radarSettings']>) => void;
}

const CATEGORY_INFO: Record<RadarCategory, { label: string; icon: any; color: string }> = {
  exam: { label: 'Exams', icon: GraduationCap, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  quiz: { label: 'Quizzes', icon: HelpCircle, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  assignment: { label: 'Assignments', icon: BookOpen, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  deadline: { label: 'Deadlines', icon: Clock, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  submission: { label: 'Submissions', icon: UploadCloud, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  marks: { label: 'Marks & Grades', icon: Award, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  important: { label: 'Important Notices', icon: Bell, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
};

const THEMES = [
  { id: 'fox', name: 'Fox Orange', color: 'bg-fox-500 border-fox-400' },
  { id: 'blue', name: 'Ocean Blue', color: 'bg-blue-500 border-blue-400' },
  { id: 'purple', name: 'Royal Purple', color: 'bg-purple-500 border-purple-400' },
  { id: 'green', name: 'Forest Green', color: 'bg-emerald-500 border-emerald-400' },
] as const;

export function SettingsView({ settings, onUpdateRadarSettings }: SettingsViewProps) {
  const radar = settings.radarSettings || {
    enabledCategories: {
      exam: true,
      quiz: true,
      assignment: true,
      deadline: true,
      submission: true,
      marks: true,
      important: true,
    },
    compactMode: false,
    colorTheme: 'fox',
    urgencySensitivity: 'standard',
  };

  const handleCategoryToggle = (category: RadarCategory) => {
    const updatedCategories = {
      ...radar.enabledCategories,
      [category]: !radar.enabledCategories[category],
    };
    onUpdateRadarSettings({ enabledCategories: updatedCategories });
  };

  const handleOpenPrivacy = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('privacy.html') });
    } else {
      window.open('/privacy.html', '_blank');
    }
  };

  return (
    <div className="px-5 pb-6 text-white/90 space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
      
      {/* Title */}
      <div>
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-fox-500" />
          Exam Radar Settings
        </h2>
        <p className="text-[10px] text-white/35 mt-0.5">Customize your academic parser & side panel UI</p>
      </div>

      {/* Categories Grid */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
          Enabled Categories
        </label>
        <div className="grid grid-cols-1 gap-1.5 max-h-[190px] overflow-y-auto pr-1">
          {(Object.keys(CATEGORY_INFO) as RadarCategory[]).map((cat) => {
            const info = CATEGORY_INFO[cat];
            const Icon = info.icon;
            const isEnabled = radar.enabledCategories[cat] !== false;

            return (
              <button
                key={cat}
                onClick={() => handleCategoryToggle(cat)}
                className={`
                  flex items-center justify-between p-2 rounded-xl border text-left transition-all duration-200
                  ${isEnabled 
                    ? 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]' 
                    : 'bg-black/10 border-white/[0.03] opacity-50 hover:opacity-70'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${info.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">{info.label}</span>
                </div>
                
                {/* Custom toggle dot */}
                <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${isEnabled ? 'bg-fox-500' : 'bg-white/10'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-3.5' : 'translate-x-0'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Settings: Theme & Compact */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Color Customization */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
            Theme Accent
          </label>
          <div className="flex items-center gap-2 py-1">
            {THEMES.map((theme) => {
              const isSelected = radar.colorTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => onUpdateRadarSettings({ colorTheme: theme.id })}
                  className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-150
                    ${theme.color}
                    ${isSelected ? 'border-white scale-110 shadow-md' : 'border-transparent hover:scale-105 opacity-80'}
                  `}
                  title={theme.name}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Mode Toggle */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
            UI Layout Mode
          </label>
          <button
            onClick={() => onUpdateRadarSettings({ compactMode: !radar.compactMode })}
            className={`
              w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all duration-200
              ${radar.compactMode 
                ? 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]' 
                : 'bg-black/10 border-white/[0.03] opacity-75'
              }
            `}
          >
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-white/50" />
              <span className="text-[11px] font-semibold">Compact UI</span>
            </div>
            <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${radar.compactMode ? 'bg-fox-500' : 'bg-white/10'}`}>
              <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${radar.compactMode ? 'translate-x-3.5' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Urgency Sensitivity */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
          Urgency Sensitivity
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['relaxed', 'standard', 'high'] as const).map((lvl) => {
            const isActive = radar.urgencySensitivity === lvl;
            const labels = { relaxed: 'Relaxed', standard: 'Standard', high: 'Aggressive' };
            const desc = { relaxed: 'Fewer alerts', standard: 'Balanced', high: 'More alerts' };
            
            return (
              <button
                key={lvl}
                onClick={() => onUpdateRadarSettings({ urgencySensitivity: lvl })}
                className={`
                  flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-200
                  ${isActive 
                    ? 'bg-fox-500/[0.08] border-fox-500 text-fox-400' 
                    : 'bg-white/[0.01] border-white/[0.04] text-white/50 hover:bg-white/[0.03] hover:text-white/70'
                  }
                `}
              >
                <span className="text-xs font-bold">{labels[lvl]}</span>
                <span className="text-[9px] opacity-60 mt-0.5">{desc[lvl]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Privacy Policy Link */}
      <div className="pt-2 text-center border-t border-white/[0.04]">
        <a
          href="#"
          onClick={handleOpenPrivacy}
          className="text-[10px] font-semibold text-white/25 hover:text-fox-400 hover:underline transition-all duration-200"
        >
          Privacy Policy
        </a>
      </div>

    </div>
  );
}
