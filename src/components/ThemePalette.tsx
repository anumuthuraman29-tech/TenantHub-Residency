import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { BackgroundTheme } from './AestheticBackground';

interface ThemeOption {
  id: BackgroundTheme;
  name: string;
  badge: string;
  dotColor: string;
  bgPreview: string;
}

const THEMES: ThemeOption[] = [
  {
    id: 'midnight_teal',
    name: 'Midnight + Teal',
    badge: 'Primary',
    dotColor: '#14B8A6',
    bgPreview: 'from-[#0F172A] to-[#111827]',
  },
  {
    id: 'nordic_navy',
    name: 'Nordic Residence',
    badge: 'Cyan',
    dotColor: '#38BDF8',
    bgPreview: 'from-[#0B132B] to-[#1C2541]',
  },
  {
    id: 'estate_emerald',
    name: 'Estate Emerald',
    badge: 'Spruce',
    dotColor: '#10B981',
    bgPreview: 'from-[#022C22] to-[#064E3B]',
  },
  {
    id: 'daylight_slate',
    name: 'Daylight Slate',
    badge: 'Cool',
    dotColor: '#2DD4BF',
    bgPreview: 'from-[#0F172A] to-[#1E293B]',
  },
];

interface ThemePaletteProps {
  currentTheme: BackgroundTheme;
  onThemeChange: (theme: BackgroundTheme) => void;
}

export const ThemePalette: React.FC<ThemePaletteProps> = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Palette Trigger Button */}
      <button
        type="button"
        id="btnThemePalette"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold transition-all shadow-sm active:scale-95"
        title="Change Residence Theme"
        aria-label="Change Residence Theme"
      >
        <span
          className="w-2.5 h-2.5 rounded-full ring-2 ring-slate-700 shrink-0"
          style={{ backgroundColor: activeThemeObj.dotColor }}
        />
        <Palette className="w-3.5 h-3.5 text-teal-400" />
        <span className="hidden sm:inline-block tracking-wide font-medium">{activeThemeObj.name}</span>
      </button>

      {/* Floating Theme Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 p-2 bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 mb-1.5 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Residence Themes
            </span>
            <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-mono font-bold">
              {activeThemeObj.badge}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {THEMES.map((theme) => {
              const isSelected = theme.id === currentTheme;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    onThemeChange(theme.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                    isSelected
                      ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full ring-1 ring-slate-600 shrink-0"
                      style={{ backgroundColor: theme.dotColor }}
                    />
                    <span>{theme.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
