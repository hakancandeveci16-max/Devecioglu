import React from 'react';
import { Truck, Calendar, Clock, MapPin, CheckCircle, ShieldCheck, Phone, Sparkles, Building2 } from 'lucide-react';
import { DISTRICT_SCHEDULE } from '../data/products';

export const BursaLogisticsSection: React.FC = () => {
  return (
    <section id="bursa-sevkiyat" className="py-14 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
            <Truck className="w-4 h-4 text-emerald-700" />
            <span>Kendi Araçlarımızla Bursa İçi Dağıtım ve Numune Ağı</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-['Plus_Jakarta_Sans']">
            Haftalık İlçe Rut ve Sevkiyat Takvimi
          </h2>
          <p className="mt-2 text-sm sm:text-base text-stone-600 leading-relaxed">
            Devecioğlu Toptan Gıda olarak Bursa&apos;daki işletmelere kendi araç filomuzla teslimat yapıyoruz. 
            <strong> Bursa merkez ilçelerine gün içinde teslimat ve numune imkanı;</strong> merkeze uzak ilçelere ise 
            <strong> 1 - 3 gün içinde</strong> güvenli teslimat ve şef numunesi ulaştırıyoruz.
          </p>
        </div>

        {/* Central vs Outer District Delivery Rule Callout & Regional Cargo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-emerald-50/90 rounded-xl border border-emerald-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 font-bold text-xs">
              01
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950 font-['Plus_Jakarta_Sans']">
                Bursa Merkez: Gün İçi Teslimat & Numune
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                <strong>Nilüfer, Osmangazi, Yıldırım ve Mudanya</strong> ilçelerine her gün kendi servis araçlarımızla gün içinde teslimat ve şef numunesi ulaştırılır.
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-50/90 rounded-xl border border-amber-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-700 text-white flex items-center justify-center shrink-0 font-bold text-xs">
              02
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950 font-['Plus_Jakarta_Sans']">
                Karacabey (Cuma) & Kestel (Perşembe)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                <strong>Karacabey</strong> için yalnız Cuma, <strong>Kestel</strong> için yalnız Perşembe günleri rut dağıtımı; numuneler 1 - 3 gün içinde teslim edilir.
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50/90 rounded-xl border border-blue-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 font-bold text-xs">
              03
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-950 font-['Plus_Jakarta_Sans']">
                Çevre İllere Kargo & Ambar İmkanı
              </h4>
              <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
                <strong>Yalova, Balıkesir, Bilecik, Kütahya, Çanakkale, Eskişehir</strong> ve diğer illerdeki işletmelere anlaşmalı ambar/kargo ile hızlı palet & koli sevkiyatı sağlanır.
              </p>
            </div>
          </div>
        </div>

        {/* Schedule Grid with Exact Min Koli Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DISTRICT_SCHEDULE.map((item, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-xl border p-5 shadow-xs hover:border-emerald-700/60 transition-all flex flex-col justify-between ${
                item.isCentral ? 'border-emerald-200/90 bg-emerald-50/10' : 'border-stone-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold text-stone-900 font-['Plus_Jakarta_Sans'] flex items-center gap-1.5">
                    {item.district}
                    {item.isCentral && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                        Merkez
                      </span>
                    )}
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {item.speed}
                  </span>
                </div>

                <div className="text-xs text-stone-500 mb-3 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                  <span>{item.zone}</span>
                </div>

                {/* Sample Speed Highlight */}
                <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200/80 text-[11px] text-stone-700 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>{item.sampleSpeed}</span>
                </div>

                <div className="space-y-1.5 py-2.5 border-t border-b border-stone-100 text-xs text-stone-700">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-stone-500">
                      <Calendar className="w-3.5 h-3.5" />
                      Sevkiyat Günleri:
                    </span>
                    <strong className="text-stone-900">{item.days}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-stone-500">
                      <Clock className="w-3.5 h-3.5" />
                      Dağıtım Saatleri:
                    </span>
                    <span className="font-mono text-stone-800">{item.deliveryTime}</span>
                  </div>
                </div>
              </div>

              {/* Exact Min Koli Requirement */}
              <div className="mt-4 pt-2.5 flex items-center justify-between text-xs border-t border-stone-150">
                <span className="text-stone-600 font-medium">Minimum Sipariş Şartı:</span>
                <span className="font-extrabold text-stone-950 bg-stone-100 px-2 py-1 rounded border border-stone-200 font-mono">
                  {item.minOrder}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Urgent Hotline Strip */}
        <div className="mt-8 p-5 rounded-2xl bg-stone-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span>Bursa Merkez Restoranları İçin Hızlı İkmal</span>
            </div>
            <h4 className="text-base font-bold font-['Plus_Jakarta_Sans']">
              Bursa Merkez İçin Gün İçi Ekspres Numune & Sevkiyat
            </h4>
            <p className="text-xs text-stone-300">
              Nilüfer, Osmangazi ve Yıldırım için gün içi teslimat; Karacabey, Mudanya ve Kestel için 1-3 günde teslimat sağlanır.
            </p>
          </div>

          <a
            href="tel:+905336475518"
            className="flex items-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Sevkiyat Hattı: 0533 647 55 18</span>
          </a>
        </div>

      </div>
    </section>
  );
};
