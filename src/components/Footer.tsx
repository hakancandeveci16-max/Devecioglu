import React from 'react';
import { MapPin, Phone, Mail, ShieldCheck, Clock, Lock } from 'lucide-react';
import { DeveciogluLogo } from './DeveciogluLogo';

interface FooterProps {
  onOpenLabModal: () => void;
  onOpenSampleModal: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLabModal, onOpenSampleModal, onOpenAdmin }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 text-xs border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Bio with Unified Co-logo */}
          <div className="space-y-4">
            <DeveciogluLogo variant="dark" size="sm" showSubtitle={false} />
            <p className="text-xs text-stone-400 leading-relaxed">
              Bursa ve çevre illerdeki restoran, baklavacı, pastane ve kafelere özel ithal ceviz içi, kuruyemiş ve kuru meyve toptan tedariği.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-1">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>İstanbul Aydın Kuruyemiş Yetkili Bursa Dağıtıcısı</span>
            </div>
          </div>

          {/* Col 2: Fast Navigation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Ürün & Hizmetler
            </h4>
            <ul className="space-y-1.5 text-stone-400">
              <li>
                <a href="#ceviz-katalogu" className="hover:text-white transition-colors">
                  İthal Kelebek Ceviz İçi (%90+)
                </a>
              </li>
              <li>
                <a href="#ceviz-katalogu" className="hover:text-white transition-colors">
                  Baklavalık Elenmiş Kırık Ceviz
                </a>
              </li>
              <li>
                <a href="#kuruyemis-katalogu" className="hover:text-white transition-colors">
                  Giresun Kavrulmuş & Çiğ Fındık
                </a>
              </li>
              <li>
                <a href="#kuruyemis-katalogu" className="hover:text-white transition-colors">
                  Boz İç Antep Fıstığı & Kaju
                </a>
              </li>
              <li>
                <a href="#kuruyemis-katalogu" className="hover:text-white transition-colors">
                  Malatya Günkurusu Kayısı & Hurma
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Corporate & Trust */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Kalite & Sipariş
            </h4>
            <ul className="space-y-1.5 text-stone-400">
              <li>
                <a
                  href="https://www.aydinkuruyemis.com.tr/kalite.asp?katid=68&kat=KAL%C4%B0TE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors text-left"
                >
                  Antioksidan & Laboratuvar Belgeleri
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenSampleModal}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Ücretsiz Şef Numune Talebi
                </button>
              </li>
              <li>
                <a href="#bursa-sevkiyat" className="hover:text-white transition-colors">
                  Bursa Haftalık İlçe Rut Planı
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-center gap-1.5 text-amber-300 font-semibold"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Yönetici Paneli (Şifreli)</span>
                </button>
              </li>
              <li>
                <span className="text-stone-500 block">
                  *Perakende online satışımız yoktur.
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Depot */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Depo & İletişim
            </h4>
            <div className="space-y-2 text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Bursa Gıda Toptancıları Sitesi, B Blok No: 124, Nilüfer / Bursa</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href="tel:+905336475518" className="hover:text-white font-mono">
                  0 (533) 647 55 18
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>Pzt - Cts: 07:30 - 18:30</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px]">
          <div>
            &copy; 2026 Devecioğlu Toptan Gıda Ticareti. Tüm hakları saklıdır.
          </div>
          <div className="flex items-center gap-4">
            <span>Bursa HORECA Toptan Dağıtım</span>
            <span>·</span>
            <span>Aydın Kuruyemiş Yetkili Satıcısı</span>
            <span>·</span>
            <button
              onClick={onOpenAdmin}
              className="text-stone-400 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3 text-amber-500" />
              <span>Yönetici Girişi</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
