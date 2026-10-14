import React from 'react';
import { ShieldCheck, FileCheck, Award, Microscope, ExternalLink } from 'lucide-react';
import { LAB_CERT_IMAGE, LAB_ANALYSIS_DATA } from '../data/products';
import aydinLogo from '../assets/images/aydin-kuruyemis-logo.png';

interface AydinLabSectionProps {
  onOpenLabModal: () => void;
}

export const AydinLabSection: React.FC<AydinLabSectionProps> = ({ onOpenLabModal }) => {
  return (
    <section className="bg-white py-14 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-2.5">
            <div className="bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs inline-flex items-center">
              <img
                src={aydinLogo}
                alt="İstanbul Aydın Kuruyemiş Logo"
                className="h-6 w-auto object-contain"
              />
            </div>
            <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>İstanbul Aydın Kuruyemiş T.A.Ş. Resmi Dağıtım Güvencesi</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-['Plus_Jakarta_Sans'] text-balance">
            Tam Antioksidan ve Aflatoksin Laboratuvar Belgeli Ürünler
          </h2>
          <p className="mt-2 text-sm sm:text-base text-stone-600 leading-relaxed">
            Devecioğlu Toptan Gıda bünyesindeki tüm ithal ceviz içi, fındık, fıstık ve kuru meyve partileri; 
            <strong> Aydın Kuruyemiş akredite gıda laboratuvarlarında</strong> düzenli olarak test edilmekte, 
            uluslararası standartlara uygunluk belgeleri ile Bursa&apos;daki işletmelere sevk edilmektedir.
          </p>
        </div>

        {/* 2-Column Split: Image with certificates overlay + Test Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Visual Column */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 shadow-md">
            <div className="relative h-64 sm:h-72 lg:h-full min-h-[280px]">
              <img
                src={LAB_CERT_IMAGE}
                alt="Aydın Kuruyemiş Akredite Laboratuvar Kalite Kontrolü"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent p-6 flex flex-col justify-end text-white">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  TÜRKAK TS EN ISO/IEC 17025
                </span>
                <h3 className="text-lg font-bold font-['Plus_Jakarta_Sans'] mt-1">
                  Akredite Gıda Güvenliği Raporları
                </h3>
                <p className="text-xs text-stone-300 mt-1">
                  Her ithalat ve üretim partisinde kimyasal ve mikrobiyolojik analizler eksiksiz tamamlanır.
                </p>
                <div className="mt-4 pt-3 border-t border-stone-700/60 flex items-center justify-between">
                  <span className="text-xs text-stone-300">Aflatoksin B1+B2+G1+G2 &lt; 0.01 ppb</span>
                  <a
                    href="https://www.aydinkuruyemis.com.tr/kalite.asp?katid=68&kat=KAL%C4%B0TE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-colors shadow-sm"
                  >
                    <span>Raporu Gör</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Cards Column */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LAB_ANALYSIS_DATA.certificates.map((cert, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-stone-50 border border-stone-200/90 hover:border-emerald-700/50 hover:bg-emerald-50/20 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-emerald-800">
                      0{idx + 1}. Analiz Kriteri
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-base font-bold text-stone-900 font-['Plus_Jakarta_Sans'] leading-snug">
                    {cert.title}
                  </h4>
                  <p className="text-xs font-semibold text-stone-700 mt-1">
                    {cert.result}
                  </p>
                  <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                    {cert.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 text-[11px] text-stone-500 font-mono">
                  Standart: {cert.standard}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Management Certifications Strip */}
        <div className="mt-8 p-4 rounded-xl bg-stone-100/90 border border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-700">
          <div className="flex items-center gap-2">
            <Microscope className="w-4 h-4 text-emerald-800 shrink-0" />
            <span className="font-semibold text-stone-900">Kurumsal Gıda Standartları:</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-stone-600 font-medium">
            {LAB_ANALYSIS_DATA.managementStandards.map((std, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                {std}
              </span>
            ))}
          </div>
          <button
            onClick={onOpenLabModal}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-4 cursor-pointer"
          >
            Tüm Sertifika & Rapor Detayları &rarr;
          </button>
        </div>

      </div>
    </section>
  );
};
