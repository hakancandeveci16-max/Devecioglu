import React from 'react';
import { ShoppingBag, ShieldCheck, MapPin, Phone, Lock } from 'lucide-react';
import { CartItem } from '../types';
import { DeveciogluLogo } from './DeveciogluLogo';

interface NavbarProps {
  cart: CartItem[];
  onOpenCart: () => void;
  onOpenLabModal: () => void;
  onOpenSampleModal: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cart,
  onOpenCart,
  onOpenLabModal,
  onOpenSampleModal,
  onOpenAdmin,
}) => {
  const totalKg = cart.reduce((acc, item) => acc + item.quantityKg, 0);
  const itemCount = cart.length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top micro bar for Bursa B2B trust notice */}
      <div className="bg-stone-900 text-stone-200 text-xs px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 border-b border-stone-800">
        <div className="flex items-center gap-2 truncate min-w-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-emerald-400 font-medium truncate text-[11px] sm:text-xs">
            Aydın Kuruyemiş Bursa Yetkili Dağıtıcısı
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-stone-300 text-[11px] sm:text-xs">
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
            title="Yönetici Girişi (Fiyat & Kategori Düzenleme)"
          >
            <Lock className="w-3 h-3 text-amber-400" />
            <span className="hidden xs:inline">Yönetici</span>
          </button>
          <span className="hidden sm:inline text-stone-600">·</span>
          <span className="hidden md:flex items-center gap-1">
            <MapPin className="w-3 h-3 text-stone-400" />
            Bursa Gıda Toptancıları Sitesi
          </span>
          <a
            href="tel:+905336475518"
            className="flex items-center gap-1 hover:text-white transition-colors text-emerald-400 font-semibold"
          >
            <Phone className="w-3 h-3" />
            <span>0533 647 55 18</span>
          </a>
        </div>
      </div>

      {/* Main Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (4 Links) - Zone 3 (1 Action) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-8">
        {/* Zone 1: Unified Primary Brand Co-Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <a href="#" className="flex items-center shrink-0 group">
            <DeveciogluLogo variant="light" size="sm" showSubtitle={false} className="sm:hidden" />
            <DeveciogluLogo variant="light" size="sm" showSubtitle={true} className="hidden sm:inline-flex" />
          </a>
        </div>

        {/* Zone 2: 4-5 single-line nav links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-700">
          <a
            href="#ceviz-katalogu"
            className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
          >
            İthal Ceviz Çeşitleri
          </a>
          <a
            href="#kuruyemis-katalogu"
            className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
          >
            Kuruyemiş & Meyve
          </a>
          <a
            href="https://www.aydinkuruyemis.com.tr/kalite.asp?katid=68&kat=KAL%C4%B0TE"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer flex items-center gap-1.5"
            title="Aydın Kuruyemiş Akredite Kalite & Laboratuvar Sayfası"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Laboratuvar & Sertifikalar</span>
          </a>
          <a
            href="#bursa-sevkiyat"
            className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
          >
            Bursa Sevkiyat Rotası
          </a>
          <button
            onClick={onOpenSampleModal}
            className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 text-stone-600 cursor-pointer"
          >
            Numune Talebi
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-stone-900 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-98 whitespace-nowrap shrink-0 cursor-pointer"
            aria-label="Teklif Sepetini Görüntüle"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Teklif Sepetim</span>
            <span className="sm:hidden font-medium">Sepet</span>
            {itemCount > 0 ? (
              <span className="bg-emerald-500 text-stone-950 font-bold text-xs px-2 py-0.5 rounded-full tabular-nums">
                {itemCount} <span className="hidden sm:inline">Kalem · {totalKg} kg</span>
              </span>
            ) : (
              <span className="text-stone-400 text-xs">(0)</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
