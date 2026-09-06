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
  currentTheme?: BackgroundTheme;
  onThemeChange?: (theme: BackgroundTheme) => void;
  className?: string;
  showLabel?: boolean;
}

export const ThemePalette: React.FC<ThemePaletteProps> = ({
  currentTheme: propTheme,
  onThemeChange: propOnChange,
  className = '',
  showLabel = true,
}) => {
  const [internalTheme, setInternalTheme] = useState<BackgroundTheme>(() => {
    const saved = localStorage.getItem('TENANT_HUB_THEME');
    const validThemes: BackgroundTheme[] = ['midnight_teal', 'nordic_navy', 'estate_emerald', 'daylight_slate'];
    if (saved && validThemes.includes(saved as BackgroundTheme)) {
      return saved as BackgroundTheme;
    }
    return 'midnight_teal';
  });

  const effectiveTheme = propTheme || internalTheme;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeThemeObj = THEMES.find((t) => t.id === effectiveTheme) || THEMES[0];

  useEffect(() => {
    const handleGlobalThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<BackgroundTheme>;
      if (customEvent.detail) {
        setInternalTheme(customEvent.detail);
      }
    };
    window.addEventListener('tenant_hub_theme_change', handleGlobalThemeChange);
    return () => window.removeEventListener('tenant_hub_theme_change', handleGlobalThemeChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTheme = (themeId: BackgroundTheme) => {
    setInternalTheme(themeId);
    localStorage.setItem('TENANT_HUB_THEME', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    document.body.setAttribute('data-theme', themeId);
    window.dispatchEvent(new CustomEvent('tenant_hub_theme_change', { detail: themeId }));
    propOnChange?.(themeId);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Palette Trigger Button */}
      <button
        type="button"
        id="btnThemePalette"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
        title="Change Residence Theme Palette"
        aria-label="Change Residence Theme Palette"
      >
        <span
          className="w-2.5 h-2.5 rounded-full ring-2 ring-slate-600 shrink-0"
          style={{ backgroundColor: activeThemeObj.dotColor }}
        />
        <Palette className="w-3.5 h-3.5 shrink-0" style={{ color: activeThemeObj.dotColor }} />
        {showLabel && (
          <span className="hidden sm:inline-block tracking-wide font-medium">
            {activeThemeObj.name}
          </span>
        )}
      </button>

      {/* Floating Theme Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 p-2.5 bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
          <div className="px-2.5 py-1.5 mb-1.5 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Residence Themes
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold"
              style={{
                backgroundColor: `${activeThemeObj.dotColor}22`,
                color: activeThemeObj.dotColor,
                border: `1px solid ${activeThemeObj.dotColor}44`,
              }}
            >
              {activeThemeObj.badge}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {THEMES.map((theme) => {
              const isSelected = theme.id === effectiveTheme;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'font-bold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: `${theme.dotColor}22`,
                          color: theme.dotColor,
                          border: `1px solid ${theme.dotColor}55`,
                        }
                      : {}
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full ring-1 ring-slate-600 shrink-0"
                      style={{ backgroundColor: theme.dotColor }}
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold">{theme.name}</span>
                      <span className="text-[10px] opacity-70">
                        {theme.id === 'midnight_teal' && 'Default Emerald Slate'}
                        {theme.id === 'nordic_navy' && 'Deep Navy & Cyan'}
                        {theme.id === 'estate_emerald' && 'Rich Spruce & Forest'}
                        {theme.id === 'daylight_slate' && 'Cool Charcoal & Mint'}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check
                      className="w-4 h-4 shrink-0 font-bold"
                      style={{ color: theme.dotColor }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
