import React, { useEffect, useState } from 'react';
import { ShieldCheck, Truck, Sparkles, MessageCircle, ArrowRight, Search, CheckCircle2 } from 'lucide-react';
import { HERO_IMAGE } from '../data/products';
import aydinLogo from '../assets/images/aydin-kuruyemis-logo.png';

export const HERO_IMAGE_STORAGE_KEY = 'devecioglu_hero_banner_image_v1';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenSampleModal: () => void;
  onOpenLabModal: () => void;
  onScrollToCatalog: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenSampleModal,
  onOpenLabModal,
  onScrollToCatalog,
}) => {
  const [heroBannerImage, setHeroBannerImage] = useState<string>(() => {
    try {
      return localStorage.getItem(HERO_IMAGE_STORAGE_KEY) || HERO_IMAGE;
    } catch {
      return HERO_IMAGE;
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem(HERO_IMAGE_STORAGE_KEY);
        setHeroBannerImage(saved || HERO_IMAGE);
      } catch {}
    };
    window.addEventListener('devecioglu_hero_image_updated', handleUpdate);
    return () => window.removeEventListener('devecioglu_hero_image_updated', handleUpdate);
  }, []);

  return (
    <section className="relative bg-gradient-to-b from-stone-100/90 via-stone-50 to-[#F8FAF8] border-b border-stone-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Accreditation Kicker with Partner Logo */}
            <div className="inline-flex flex-wrap items-center gap-2.5 px-3 py-1.5 rounded-xl bg-stone-900 text-stone-100 text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="bg-white px-2 py-0.5 rounded-md inline-flex items-center shrink-0 shadow-2xs">
                <img
                  src={aydinLogo}
                  alt="Aydın Kuruyemiş"
                  className="h-4.5 w-auto object-contain"
                />
              </span>
              <span className="text-stone-500">|</span>
              <span>İstanbul Aydın Kuruyemiş Bursa Dağıtım Bayiliği</span>
              <span className="text-stone-500">·</span>
              <span className="text-emerald-400 font-medium">B2B Toptan Tedarik</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.15] font-['Plus_Jakarta_Sans'] text-balance">
              Bursa İşletmelerine Özel <br />
              <span className="text-emerald-800">Seçme İthal Ceviz İçi</span> ve Toptan Kuruyemiş
            </h1>

            {/* Subtitle / Business Explanation */}
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl">
              Devecioğlu Toptan Gıda olarak Bursa genelindeki restoran, baklavacı, pastane ve kafelere 
              kendi araçlarımızla düzenli toptan sevkiyat yapıyoruz. <strong>Çevre illere (Balıkesir, Yalova, Bilecik, Kütahya, Çanakkale, Eskişehir ve tüm Türkiye&apos;ye) anlaşmalı ambar ve kargo ile hızlı gönderim sağlıyoruz.</strong> <strong>Yerli ceviz içi bulundurmuyoruz;</strong> tüm cevizlerimiz 
              özenle seçilmiş, yüksek kelebek oranlı <strong>ithal ürünlerdir</strong>. Fiyatlarımız ürünün kalibre, kalite sınıfı ve tonajına göre <strong>ürüne özel</strong> belirlenir.
            </p>

            {/* Search Bar for Direct Catalog Navigation */}
            <div className="pt-2 max-w-xl">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ürün veya kalite ara (Örn: Şili kelebek, baklavalık kırık, Giresun fındık, kaju...)"
                  className="w-full pl-12 pr-28 py-3.5 bg-white border border-stone-300 rounded-xl text-sm font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 shadow-sm"
                />
                <button
                  onClick={onScrollToCatalog}
                  className="absolute right-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Listele
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-stone-500">
                <span>Popüler:</span>
                <button
                  onClick={() => setSearchQuery('Şili')}
                  className="hover:text-emerald-800 underline underline-offset-2 cursor-pointer"
                >
                  Şili Ekstra Kelebek
                </button>
                <span>·</span>
                <button
                  onClick={() => setSearchQuery('Baklavalık')}
                  className="hover:text-emerald-800 underline underline-offset-2 cursor-pointer"
                >
                  Baklavalık Tozsuz Kırık
                </button>
                <span>·</span>
                <button
                  onClick={() => setSearchQuery('Fındık')}
                  className="hover:text-emerald-800 underline underline-offset-2 cursor-pointer"
                >
                  Giresun Kavrulmuş Fındık
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onScrollToCatalog}
                className="flex items-center gap-2 px-6 py-3.5 bg-stone-900 hover:bg-emerald-900 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
              >
                <span>Toptan Kataloğu İncele</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                onClick={onOpenSampleModal}
                className="flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Ücretsiz Şef Numunesi İste</span>
              </button>

              <a
                href="https://wa.me/905336475518?text=Merhaba%20Devecioğlu%20Toptan%20Gıda,%20işletmemiz%20için%20toptan%20ceviz%20içi%20ve%20kuruyemiş%20fiyat%20teklifi%20almak%20istiyoruz."
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-sm font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-700" />
                <span>WhatsApp Hızlı Fiyat</span>
              </a>
            </div>

            {/* Trust Pill-free Metadata Row including Çevre İllere Kargo */}
            <div className="pt-4 border-t border-stone-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900 font-semibold">%100 İthal Seçme Ceviz</strong>
                  <span>Şili & California menşeili yüksek kelebek oranı</span>
                </div>
              </div>

              <div className="flex items-start gap-2 cursor-pointer group" onClick={onOpenLabModal}>
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <strong className="block text-stone-900 font-semibold group-hover:text-emerald-800">
                    Aydın Kuruyemiş Belgeli
                  </strong>
                  <span>Tüm partiler antioksidan & mikrobiyoloji testli</span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                <Truck className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-emerald-950 font-bold">Çevre İllere Kargo & Ambar</strong>
                  <span className="text-[11px] text-emerald-800">Bursa içi kapıya servis; çevre illere anlaşmalı ambar/kargo imkanı</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Visual Image Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-300/80 bg-stone-900">
              <img
                src={heroBannerImage}
                alt="Devecioğlu Toptan İthal Ceviz İçi ve Kuruyemiş Deposu"
                className="w-full h-80 sm:h-96 lg:h-[460px] object-cover hover:scale-103 transition-transform duration-700"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/90 text-stone-950 text-xs font-bold uppercase tracking-wider">
                    Bursa Toptan Sevkiyat
                  </div>
                  <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans'] leading-tight">
                    Yeni Mahsul İthal Çift Kat Vakumlu Koliler
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Fırında kararmayan, şerbeti kusursuz çeken baklavalık cevizler ve lüks kelebek sunum kalibreleri haftalık taze stoklarla işletmenizde.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-700/60 flex items-center justify-between text-xs text-stone-300">
                  <span>Minimum Sipariş: 10 kg Koli</span>
                  <span className="font-semibold text-emerald-400">Restoran & Kafe İskontosu</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
