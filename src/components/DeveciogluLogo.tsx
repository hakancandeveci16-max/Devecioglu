import React, { useEffect, useState } from 'react';
import aydinLogo from '../assets/images/aydin-kuruyemis-logo.png';
import { saveSiteLogoToSupabase } from '../lib/supabase';

export type LogoStyle = 'official-walnut' | 'aydin-partner' | 'modern-walnut' | 'gold-crest' | 'corporate-green' | 'custom';

export interface LogoConfig {
  style: LogoStyle;
  customUrl?: string;
  brandText?: string;
  subText?: string;
}

export const LOGO_PRESETS: { id: LogoStyle; name: string; description: string; badge: string }[] = [
  {
    id: 'official-walnut',
    name: 'Devecioğlu Resmi Çifte Ceviz Logosu (Siyah-Beyaz İllüstrasyon)',
    description: 'Resmi çifte ceviz illüstrasyonu ve Devecioğlu Toptan Gıda Ticareti tipografisi',
    badge: 'Resmi Firma Logosu',
  },
  {
    id: 'aydin-partner',
    name: 'Aydın Kuruyemiş & Devecioğlu (Resmi Dağıtıcı Ko-Logosu)',
    description: 'Aydın Kuruyemiş resmi logosu ile Devecioğlu kurumsal kimliğinin prestijli ortak tasarımı',
    badge: 'Yetkili Ortak Ko-Logo',
  },
  {
    id: 'modern-walnut',
    name: 'Modern Geometrik Kelebek Ceviz',
    description: 'Yüksek kaliteli seçme açık kelebek ceviz içi figürlü, zümrüt yeşili modern monogram',
    badge: 'Modern B2B',
  },
  {
    id: 'gold-crest',
    name: 'Klasik Altın Yaldızlı Mühür',
    description: 'Geleneksel Bursa toptancı güvenini temsil eden altın çelenkli ve defne yapraklı kurumsal mühür',
    badge: 'Lüks Mühür',
  },
  {
    id: 'corporate-green',
    name: 'Minimalist Orman Yeşili Tipografi',
    description: 'Sade, doğrudan ve şık uluslararası gıda ihracat/ithalat standardında tipografik logo',
    badge: 'Sade Kurumsal',
  },
];

export const DEFAULT_LOGO_CONFIG: LogoConfig = {
  style: 'official-walnut',
  brandText: 'DEVECİOĞLU',
  subText: 'İthal Ceviz İçi & Kuruyemiş Tedariği · Bursa',
};

const LOGO_STORAGE_KEY = 'devecioglu_site_logo_v3';

export const getSiteLogoConfig = (): LogoConfig => {
  try {
    const saved = localStorage.getItem(LOGO_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_LOGO_CONFIG;
};

export const saveSiteLogoConfig = (config: LogoConfig) => {
  try {
    localStorage.setItem(LOGO_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('devecioglu_logo_updated'));
  } catch {}
  // Also save directly to Supabase cloud database
  saveSiteLogoToSupabase(config);
};

interface DeveciogluLogoProps {
  variant?: 'light' | 'dark' | 'emblem' | 'full';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
  forcedStyle?: LogoStyle;
  forcedCustomUrl?: string;
}

export const DeveciogluLogo: React.FC<DeveciogluLogoProps> = ({
  variant = 'light',
  size = 'md',
  className = '',
  showSubtitle = true,
  forcedStyle,
  forcedCustomUrl,
}) => {
  const [config, setConfig] = useState<LogoConfig>(() => getSiteLogoConfig());

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getSiteLogoConfig());
    };
    window.addEventListener('devecioglu_logo_updated', handleUpdate);
    return () => window.removeEventListener('devecioglu_logo_updated', handleUpdate);
  }, []);

  const activeStyle = forcedStyle || config.style;
  const activeCustomUrl = forcedCustomUrl || config.customUrl;
  const isDark = variant === 'dark';

  // Dimension definitions
  const dimensions = {
    xs: { emblem: 28, imgH: 26, text: 'text-sm', sub: 'text-[9px]', gap: 'gap-2' },
    sm: { emblem: 36, imgH: 32, text: 'text-base', sub: 'text-[10px]', gap: 'gap-2.5' },
    md: { emblem: 44, imgH: 40, text: 'text-xl', sub: 'text-[11px]', gap: 'gap-3' },
    lg: { emblem: 56, imgH: 52, text: 'text-2xl', sub: 'text-xs', gap: 'gap-3.5' },
    xl: { emblem: 72, imgH: 64, text: 'text-3xl', sub: 'text-sm', gap: 'gap-4' },
  }[size];

  // 0. OFFICIAL WALNUT LOGO (Official illustration logo uploaded by user)
  if (activeStyle === 'official-walnut') {
    return (
      <div className={`inline-flex items-center ${dimensions.gap} ${className} group`}>
        <div
          className={`flex items-center justify-center shrink-0 rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-103 bg-black p-1 border ${
            isDark ? 'border-stone-800' : 'border-stone-300 shadow-2xs'
          }`}
          style={{ width: dimensions.imgH + 4, height: dimensions.imgH + 4 }}
        >
          <img
            src="/favicon.svg"
            alt="Devecioğlu Toptan Gıda"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`${dimensions.text} font-black tracking-tight font-['Plus_Jakarta_Sans'] transition-colors ${
                isDark ? 'text-white group-hover:text-amber-400' : 'text-stone-900 group-hover:text-emerald-800'
              }`}
            >
              DEVECİOĞLU
            </span>
            <span
              className={`${dimensions.sub} font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border hidden sm:inline-block ${
                isDark
                  ? 'text-amber-400 bg-amber-950/60 border-amber-700/60'
                  : 'text-emerald-800 bg-emerald-50 border-emerald-200'
              }`}
            >
              Toptan Gıda Ticareti
            </span>
          </div>

          {showSubtitle && (
            <span
              className={`${dimensions.sub} font-medium mt-1 tracking-tight hidden sm:block ${
                isDark ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              İthal Ceviz İçi & Kuruyemiş Tedariği · Bursa
            </span>
          )}
        </div>
      </div>
    );
  }

  // 1. CUSTOM UPLOADED LOGO
  if (activeStyle === 'custom' && activeCustomUrl) {
    return (
      <div className={`inline-flex items-center ${dimensions.gap} ${className} group`}>
        <img
          src={activeCustomUrl}
          alt="Devecioğlu Toptan Gıda Logosu"
          style={{ height: dimensions.imgH }}
          className="w-auto object-contain shrink-0 max-w-[220px] rounded transition-transform group-hover:scale-102"
        />
        {showSubtitle && (
          <div className="flex flex-col justify-center leading-none">
            <span
              className={`${dimensions.text} font-black tracking-tight font-['Plus_Jakarta_Sans'] ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}
            >
              DEVECİOĞLU
            </span>
            <span
              className={`${dimensions.sub} font-medium mt-1 tracking-tight ${
                isDark ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              Toptan İthal Ceviz & Kuruyemiş · Bursa
            </span>
          </div>
        )}
      </div>
    );
  }

  // 2. AYDIN KURUYEMİŞ & DEVECİOĞLU ORTAK KO-LOGO (Resmi Dağıtıcı)
  if (activeStyle === 'aydin-partner') {
    return (
      <div className={`inline-flex items-center ${dimensions.gap} ${className} group`}>
        {/* Left: Official Aydin Kuruyemis Logo Badge */}
        <div
          className={`flex items-center justify-center shrink-0 rounded-xl transition-all duration-300 group-hover:shadow-md ${
            isDark
              ? 'bg-white p-1.5 border border-stone-700/80'
              : 'bg-white p-1.5 border border-stone-200/90 shadow-2xs'
          }`}
          style={{ height: dimensions.imgH + 6 }}
        >
          <img
            src={aydinLogo}
            alt="Aydın Kuruyemiş Yetkili Dağıtıcısı"
            className="h-full w-auto object-contain max-h-[36px]"
          />
        </div>

        {/* Center Divider Line */}
        <div
          className={`h-7 w-[1.5px] shrink-0 ${isDark ? 'bg-stone-700' : 'bg-stone-300'}`}
          aria-hidden="true"
        />

        {/* Right: Devecioglu Wordmark */}
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`${dimensions.text} font-black tracking-tight font-['Plus_Jakarta_Sans'] transition-colors ${
                isDark ? 'text-white group-hover:text-amber-400' : 'text-stone-900 group-hover:text-emerald-800'
              }`}
            >
              DEVECİOĞLU
            </span>
            <span
              className={`${dimensions.sub} font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border hidden sm:inline-block ${
                isDark
                  ? 'text-amber-400 bg-amber-950/60 border-amber-700/60'
                  : 'text-emerald-800 bg-emerald-50 border-emerald-200'
              }`}
            >
              Bursa Yetkili Dağıtıcı
            </span>
          </div>

          {showSubtitle && (
            <span
              className={`${dimensions.sub} font-medium mt-1 tracking-tight hidden sm:block ${
                isDark ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              Aydın Kuruyemiş Güvencesiyle İthal Ceviz & Çerez
            </span>
          )}
        </div>
      </div>
    );
  }

  // 3. MODERN WALNUT EMBLEM (Style: 'modern-walnut')
  if (activeStyle === 'modern-walnut') {
    return (
      <div className={`inline-flex items-center ${dimensions.gap} ${className} group`}>
        <div
          className={`shrink-0 rounded-xl flex items-center justify-center p-1.5 transition-transform duration-300 group-hover:scale-105 ${
            isDark ? 'bg-emerald-950/80 border border-emerald-700/60' : 'bg-emerald-50 border border-emerald-200'
          }`}
          style={{ width: dimensions.emblem, height: dimensions.emblem }}
        >
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="22" stroke={isDark ? '#34D399' : '#059669'} strokeWidth="1.5" />
            <path
              d="M24 10C16 10 12 18 12 26C12 34 18 38 24 40C30 38 36 34 36 26C36 18 32 10 24 10Z"
              fill={isDark ? '#064E3B' : '#ECFDF5'}
              stroke={isDark ? '#F59E0B' : '#047857'}
              strokeWidth="2"
            />
            <path d="M24 11V39" stroke={isDark ? '#F59E0B' : '#047857'} strokeWidth="1.8" strokeLinecap="round" />
            <path
              d="M16 20C18 24 18 28 16 32M32 20C30 24 30 28 32 32"
              stroke={isDark ? '#FDE68A' : '#10B981'}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`${dimensions.text} font-black tracking-tight font-['Plus_Jakarta_Sans'] ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}
            >
              DEVECİOĞLU
            </span>
            <span
              className={`${dimensions.sub} font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border hidden sm:inline-block ${
                isDark
                  ? 'text-emerald-400 bg-emerald-950/60 border-emerald-700/60'
                  : 'text-emerald-800 bg-emerald-50 border-emerald-200'
              }`}
            >
              Toptan Gıda
            </span>
          </div>

          {showSubtitle && (
            <span
              className={`${dimensions.sub} font-medium mt-1 tracking-tight hidden sm:block ${
                isDark ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              Seçme İthal Ceviz İçi & Toptan Kuruyemiş · Bursa
            </span>
          )}
        </div>
      </div>
    );
  }

  // 4. CORPORATE GREEN (Style: 'corporate-green')
  if (activeStyle === 'corporate-green') {
    return (
      <div className={`inline-flex items-center ${dimensions.gap} ${className} group`}>
        <div
          className="rounded-lg bg-emerald-700 text-white font-black flex items-center justify-center font-['Plus_Jakarta_Sans'] shrink-0 shadow-xs"
          style={{ width: dimensions.emblem - 4, height: dimensions.emblem - 4 }}
        >
          <span className="text-lg tracking-tighter">D</span>
          <span className="text-amber-300 text-xs font-bold -ml-0.5">·</span>
        </div>

        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`${dimensions.text} font-extrabold tracking-tight font-['Plus_Jakarta_Sans'] ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}
            >
              DEVECİOĞLU
            </span>
            <span className="text-xs font-bold text-emerald-600">KURUMSAL</span>
          </div>
          {showSubtitle && (
            <span className={`text-[10px] font-medium mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Bursa B2B Gıda & Ceviz İçi Dağıtımı
            </span>
          )}
        </div>
      </div>
    );
  }

  // 5. GOLD CREST (Default fallback / Heritage)
  return (
    <div className={`inline-flex items-center ${dimensions.gap} ${className} group`}>
      <svg
        width={dimensions.emblem}
        height={dimensions.emblem}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 group-hover:scale-105"
        aria-label="Devecioğlu Toptan Gıda Ceviz Logosu"
      >
        <circle cx="60" cy="60" r="54" stroke={isDark ? '#F59E0B' : '#059669'} strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="60" cy="60" r="50" fill={isDark ? '#064E3B' : '#ECFDF5'} stroke={isDark ? '#D97706' : '#047857'} strokeWidth="2.5" />
        <circle cx="60" cy="60" r="45" stroke={isDark ? '#FDE68A' : '#D97706'} strokeWidth="1" opacity="0.8" />
        {/* Botanical Leaves */}
        <path d="M26 62C24 57 26 50 30 46C31 52 29 59 26 62Z" fill={isDark ? '#34D399' : '#059669'} />
        <path d="M94 62C96 57 94 50 90 46C89 52 91 59 94 62Z" fill={isDark ? '#34D399' : '#059669'} />
        {/* Walnut Kernel */}
        <path
          d="M60 24C48 24 38 35 38 50C38 66 47 86 58 95C59.2 96 60.8 96 62 95C73 86 82 66 82 50C82 35 72 24 60 24Z"
          fill={isDark ? '#022C22' : '#FFFFFF'}
          stroke={isDark ? '#F59E0B' : '#047857'}
          strokeWidth="2.2"
        />
        <path d="M60 25V95" stroke={isDark ? '#F59E0B' : '#047857'} strokeWidth="2" strokeLinecap="round" />
      </svg>

      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`${dimensions.text} font-black tracking-tight font-['Plus_Jakarta_Sans'] ${
              isDark ? 'text-white' : 'text-stone-900'
            }`}
          >
            DEVECİOĞLU
          </span>
          <span
            className={`${dimensions.sub} font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
              isDark ? 'text-amber-400 bg-amber-950/60 border-amber-700/60' : 'text-emerald-800 bg-emerald-50 border-emerald-200'
            }`}
          >
            Toptan Gıda
          </span>
        </div>
        {showSubtitle && (
          <span className={`${dimensions.sub} font-medium mt-1 tracking-tight ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            İthal Ceviz İçi & Kuruyemiş Tedariği · Bursa
          </span>
        )}
      </div>
    </div>
  );
};
