import React from 'react';
import { BackgroundTheme } from './AestheticBackground';

interface DesignShowcaseProps {
  onSelectPage: (page: string) => void;
  onSelectTheme: (theme: BackgroundTheme) => void;
  currentTheme: BackgroundTheme;
}

export const DesignShowcase: React.FC<DesignShowcaseProps> = ({
  onSelectPage,
  onSelectTheme,
  currentTheme,
}) => {
  const backgrounds: { id: BackgroundTheme; title: string; desc: string; previewClass: string; accentColor: string }[] = [
    {
      id: 'midnight_teal',
      title: '🌊 Smart Residence — Midnight + Teal',
      desc: 'Flagship deep navy canvas, ambient glowing teal lighting, architectural grid overlay, and clean geometric contrast.',
      previewClass: 'from-[#0F172A] via-[#111827] to-[#0A0F1D] border-teal-500/50',
      accentColor: 'text-teal-300',
    },
    {
      id: 'nordic_navy',
      title: '❄️ Nordic Residence — Navy + Sky Cyan',
      desc: 'Minimalist deep indigo and cool slate with sky cyan accents and subtle constellation network nodes.',
      previewClass: 'from-[#0B132B] via-[#1C2541] to-[#090E1F] border-sky-500/50',
      accentColor: 'text-sky-300',
    },
    {
      id: 'estate_emerald',
      title: '🌲 Estate Residence — Spruce + Emerald',
      desc: 'High-end botanical dark spruce canvas with emerald lighting and sophisticated executive accents.',
      previewClass: 'from-[#022C22] via-[#064E3B] to-[#0A1F18] border-emerald-500/50',
      accentColor: 'text-emerald-300',
    },
    {
      id: 'daylight_slate',
      title: '🏢 Daylight Slate — Cool Slate & Modern Teal',
      desc: 'Balanced slate architectural palette with cool teal utility highlights and high-contrast typography.',
      previewClass: 'from-[#0F172A] via-[#1E293B] to-[#0B1220] border-teal-400/50',
      accentColor: 'text-teal-300',
    },
  ];

  const pages = [
    { id: 'customermainpage', name: 'Customer Dashboard', role: 'Resident' },
    { id: 'paymentpage', name: 'Payment Details & Bill Breakdown', role: 'Resident' },
    { id: 'paypage', name: 'PhonePe & UPI Checkout', role: 'Resident' },
    { id: 'rentpage', name: 'Rent Ledger Table', role: 'Resident' },
    { id: 'waterbillpage', name: 'Water Meter Ledger Table', role: 'Resident' },
    { id: 'adminmainpage', name: 'Admin Operations Desk', role: 'Admin' },
  ];

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto my-6 p-6 sm:p-8 bg-[#0F172A]/90 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-8">
        <span className="text-xs uppercase font-bold tracking-widest text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
          Design System & Theme Switcher
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider mt-2">
          Tenant Hub Residence Themes
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {backgrounds.map((bg) => {
          const isSelected = currentTheme === bg.id;
          return (
            <div
              key={bg.id}
              onClick={() => onSelectTheme(bg.id)}
              className={`p-5 rounded-2xl bg-gradient-to-br ${bg.previewClass} border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'ring-2 ring-teal-400 scale-[1.02] shadow-xl'
                  : 'opacity-80 hover:opacity-100 hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-bold text-base ${bg.accentColor}`}>{bg.title}</h3>
                {isSelected && (
                  <span className="text-xs bg-teal-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{bg.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-800 pt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Quick View Pages
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPage(p.id)}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-left border border-slate-800 hover:border-teal-500/40 transition group"
            >
              <div className="text-xs font-bold text-white group-hover:text-teal-300">{p.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{p.role}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
