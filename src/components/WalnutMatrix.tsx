import React from 'react';
import { Sparkles, Check, ChevronRight, RefreshCw } from 'lucide-react';
import { Product } from '../types';

interface WalnutMatrixProps {
  products: Product[];
  onSelectVariety: (varietyQuery: string) => void;
}

export const WalnutMatrix: React.FC<WalnutMatrixProps> = ({ products = [], onSelectVariety }) => {
  // Yönetici panelinde güncellenen ürünlerle anında senkronize ol
  const pKelebek = products.find((p) => p.id === 'ceviz-ekstra-kelebek-sili') ||
    products.find((p) => p.category === 'ceviz' && (p.name.includes('Kelebek') || p.grade === 'Ekstra Lüks'));

  const pCeyrek = products.find((p) => p.id === 'ceviz-acik-ceyrek') ||
    products.find((p) => p.category === 'ceviz' && (p.name.includes('Çeyrek') || p.variety?.includes('Çeyrek')));

  const pBaklavalik = products.find((p) => p.id === 'ceviz-baklavalik-elenmis-kirik') ||
    products.find((p) => p.category === 'ceviz' && (p.name.includes('Baklavalık') || p.variety?.includes('Baklavalık')));

  const pPastalik = products.find((p) => p.id === 'ceviz-pastalik-tatlicilik-kirik') ||
    products.find((p) => p.category === 'ceviz' && (p.name.includes('Pastalık') || p.name.includes('Unlu Mamul')));

  const formatPrice = (p: Product | undefined, fallback: string) => {
    if (!p) return fallback;
    if (p.minPrice && p.maxPrice) return `${p.minPrice} - ${p.maxPrice} ₺ / kg`;
    if (p.minPrice) return `${p.minPrice} ₺ / kg`;
    return p.indicativePriceRange || fallback;
  };

  const GRADES = [
    {
      title: pKelebek?.name || 'Şili Ekstra Açık Kelebek (%90+)',
      tag: pKelebek?.grade || 'Ekstra Lüks',
      badgeColor: 'text-amber-800 bg-amber-50 border-amber-200',
      priceRange: formatPrice(pKelebek, '440 - 495 ₺ / kg'),
      targetSectors: 'Lüks Restoranlar · Şarküteri · Soğuk Meze · Vitrin',
      desc: pKelebek?.description || 'Özenle seçilmiş yarım bütün kelebekler. Açık altın rengi, sıfır acılık ve zengin ceviz aroması.',
      pros: ['%90+ Eksiksiz Kelebek Bütünlük', 'Sunumda Prestijli Görünüm', 'Açık Sarı Lüks Renk Tonu'],
      query: 'Kelebek (%90+)',
      product: pKelebek,
    },
    {
      title: pCeyrek?.name || 'Açık Renk Çeyrek Ceviz İçi',
      tag: pCeyrek?.grade || '1. Kalite',
      badgeColor: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      priceRange: formatPrice(pCeyrek, '380 - 430 ₺ / kg'),
      targetSectors: 'Genel Mutfak · Salatalar · Gavurdağı · Mezeler',
      desc: pCeyrek?.description || 'Mutfakta doğrama ve kırma işçiliğini ortadan kaldıran, tozsuz ve homojen boy çeyrek parçalar.',
      pros: ['Sıfır Kabuk ve Toz Firesi', 'Mutfak Hazırlığında Zaman Tasarrufu', 'Yüksek Yağ ve Tazelik Oranı'],
      query: 'Çeyrek',
      product: pCeyrek,
    },
    {
      title: pBaklavalik?.name || 'Baklavalık Özel Elenmiş Kırık',
      tag: pBaklavalik?.grade || 'Tatlıcı Özel',
      badgeColor: 'text-blue-800 bg-blue-50 border-blue-200',
      priceRange: formatPrice(pBaklavalik, '350 - 410 ₺ / kg'),
      targetSectors: 'Bursa Baklavacıları · Şerbetli Tatlılar · Süt Helvası',
      desc: pBaklavalik?.description || '4-8 mm özel eleklerden geçirilmiş, tozu arındırılmış, fırında kesinlikle kararma yapmayan açık renk ceviz.',
      pros: ['Şerbeti Homojen Emen Yapı', 'Yüksek Isıda Kararma Yapmaz', 'Sıfır Toz İle Net Gramaj Verimi'],
      query: 'Baklavalık',
      product: pBaklavalik,
    },
    {
      title: pPastalik?.name || 'Pastalık & Fırın Kırık Ceviz',
      tag: pPastalik?.grade || 'Endüstriyel',
      badgeColor: 'text-stone-800 bg-stone-100 border-stone-200',
      priceRange: formatPrice(pPastalik, '310 - 365 ₺ / kg'),
      targetSectors: 'Pastaneler · Fırınlar · Kek & Kurabiye İmalatı',
      desc: pPastalik?.description || 'Hamur işleri ve dolgular için en ekonomik ve lezzetli toptan çözüm. Taze aromasıyla fırın ürünlerine lezzet katar.',
      pros: ['Ekonomik Toptan KG Fiyatı', 'Hamura Eşit Dağılan Tane Boyu', 'Yüksek Pişirme Dayanımı'],
      query: 'Pastalık',
      product: pPastalik,
    },
  ];

  return (
    <section id="ceviz-katalogu" className="py-14 bg-stone-100/70 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>%100 Seçme İthal Ceviz İçi Karşılaştırma Matrisi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-['Plus_Jakarta_Sans']">
            İşletmenizin İhtiyacına Göre Ceviz İçi Çeşitleri ve Fiyat Kademeleri
          </h2>
          <p className="mt-2 text-sm sm:text-base text-stone-600 leading-relaxed">
            Devecioğlu Toptan Gıda&apos;da yerli ceviz bulunmamakta, tüm ürünler açık renk ve yüksek verimli 
            <strong> seçme ithal cevizlerden</strong> oluşmaktadır. Ürünün kalite sınıfına, kelebek oranına ve tonajına göre 
            fiyatlar <strong>ürüne özel</strong> olarak belirlenmektedir.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {GRADES.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-700/60 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header with Tag & Title */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${item.badgeColor}`}>
                    {item.tag}
                  </span>
                  <span className="text-xs text-stone-600 font-mono">0{idx + 1}</span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 font-['Plus_Jakarta_Sans'] leading-snug group-hover:text-emerald-800 transition-colors">
                  {item.title}
                </h3>

                {/* Indicative Price Range */}
                <div className="mt-3 p-2.5 rounded-lg bg-stone-50 border border-stone-150">
                  <div className="text-[11px] text-stone-500 font-medium">Gösterge Toptan Fiyat Bandı</div>
                  <div className="text-base font-extrabold text-stone-900 font-mono tracking-tight tabular-nums">
                    {item.priceRange}
                  </div>
                  <div className="text-[10px] text-emerald-800 font-medium mt-0.5">
                    *Ürünün kalibre ve kalitesine göre ürüne özel fiyat verilir
                  </div>
                </div>

                <div className="mt-3 text-xs text-stone-600 font-medium">
                  <strong className="text-stone-900">Uygun Sektörler:</strong> {item.targetSectors}
                </div>

                <p className="mt-2 text-xs text-stone-500 leading-relaxed">
                  {item.desc}
                </p>

                {/* Pros */}
                <ul className="mt-4 space-y-1.5 text-xs text-stone-700">
                  {item.pros.map((pro, pidx) => (
                    <li key={pidx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectVariety(item.query)}
                className="mt-6 w-full py-2.5 px-3 bg-stone-900 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Bu Kaliteyi İncele</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Info Note on Custom Pricing */}
        <div className="mt-8 p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div>
            <strong className="font-bold text-amber-900">Neden Fiyatlar Ürüne Özel Veriliyor?</strong>
            <p className="text-amber-800/90 mt-0.5">
              Gıda toptancılığında sabit perakende liste fiyatı yerine; tercih edilen ürünün kelebek oranına, parça büyüklüğüne, 
              ambalaj tipine ve sipariş hacmine göre ürüne özel en rekabetçi net koli/kg teklifi sunulur.
            </p>
          </div>
          <a
            href="https://wa.me/905336475518?text=Merhaba,%20Devecioğlu%20Toptan%20Gıda'dan%20ürüne%20özel%20toptan%20fiyat%20öğrenmek%20istiyoruz."
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-semibold shrink-0 transition-colors"
          >
            Hemen Fiyat Al
          </a>
        </div>

      </div>
    </section>
  );
};
