import { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { themes } from '../themes';
import type { ThemeName } from '../themes';

const themeOrder: ThemeName[] = ['warm', 'minimal', 'medical'];
const themeColors: Record<ThemeName, { bg: string; accent: string }> = {
  warm: { bg: '#FDF8F5', accent: '#E07A5F' },
  minimal: { bg: '#F8F7F4', accent: '#2D6B5A' },
  medical: { bg: '#F8FBFF', accent: '#5DADE2' },
};

export default function ThemeSelector() {
  const { themeName, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 rounded-xl bg-base-deep flex items-center justify-center text-text-muted hover:text-text transition-colors duration-200"
        aria-label="外観設定"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade" onClick={() => setOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-text/20 backdrop-blur-sm" />

          {/* Bottom sheet */}
          <div
            className="relative w-full max-w-lg bg-surface rounded-t-3xl p-5 pb-8 animate-page"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-line mx-auto mb-5" />

            <h3 className="text-base font-bold text-text mb-4">外観を設定</h3>

            <p className="text-xs font-bold text-text-muted mb-2">テーマ</p>
            <div className="space-y-2.5">
              {themeOrder.map((name) => {
                const t = themes[name];
                const colors = themeColors[name];
                const active = themeName === name;

                return (
                  <button
                    key={name}
                    onClick={() => { setTheme(name); setOpen(false); }}
                    className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all duration-200 text-left ${
                      active
                        ? 'border-primary bg-primary-light'
                        : 'border-line bg-base hover:border-text-faint'
                    }`}
                  >
                    {/* Color preview */}
                    <div
                      className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{ background: colors.bg, border: `2px solid ${colors.accent}` }}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ background: colors.accent }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text">{t.label}</p>
                      <p className="text-xs text-text-muted mt-0.5">{t.description}</p>
                    </div>

                    {active && (
                      <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
