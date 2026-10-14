import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { saveSampleRequestToSupabase } from '../lib/supabase';
import { DeveciogluLogo } from './DeveciogluLogo';
import {
  ArrowLeft,
  Check,
  Sparkles,
  Building,
  MapPin,
  MessageCircle,
  Truck,
  Clock,
  ShieldCheck,
  ExternalLink,
  Boxes,
  X,
  FileText,
} from 'lucide-react';

interface SampleRequestPageProps {
  products: Product[];
  preSelectedProductId?: string;
  onBackToHome: () => void;
}

export const SampleRequestPage: React.FC<SampleRequestPageProps> = ({
  products,
  preSelectedProductId,
  onBackToHome,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [district, setDistrict] = useState('Nilüfer');
  const [selectedIds, setSelectedIds] = useState<string[]>(
    preSelectedProductId
      ? [preSelectedProductId]
      : ['ceviz-baklavalik-elenmis-kirik', 'ceviz-ekstra-kelebek-sili']
  );
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('Ceviz');

  const isCentralDistrict = ['Nilüfer', 'Osmangazi', 'Yıldırım', 'Mudanya'].includes(district);

  // Helper to categorize products for the sample picker
  const getProductCategory = (p: Product): string => {
    const text = (p.name + ' ' + p.id + ' ' + p.category + ' ' + p.variety).toLowerCase();
    if (text.includes('ceviz')) return 'Ceviz';
    if (text.includes('badem')) return 'Badem';
    if (text.includes('fındık') || text.includes('findik')) return 'Fındık';
    if (text.includes('fıstık') || text.includes('fistik') || text.includes('antep') || text.includes('kaju')) return 'Antep Fıstığı & Kaju';
    if (p.category === 'kuru-meyve' || text.includes('kayısı') || text.includes('hurma')) return 'Kuru Meyve';
    return 'Diğer';
  };

  const sampleCategories = [
    { id: 'Ceviz', label: 'Ceviz Çeşitleri' },
    { id: 'Badem', label: 'Badem Çeşitleri' },
    { id: 'Fındık', label: 'Fındık Çeşitleri' },
    { id: 'Antep Fıstığı & Kaju', label: 'Antep Fıstığı & Kaju' },
    { id: 'Kuru Meyve', label: 'Kuru Meyve' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => getProductCategory(p) === activeCategoryTab);
  }, [products, activeCategoryTab]);

  const selectedProducts = useMemo(() => {
    return products.filter((p) => selectedIds.includes(p.id));
  }, [products, selectedIds]);

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const removeProduct = (id: string) => {
    setSelectedIds((prev) => prev.filter((p) => p !== id));
  };

  // Çok sadeleştirilmiş hazır WhatsApp taslak mesajı
  const generateWhatsAppMessage = () => {
    const selectedNames = selectedProducts
      .map((p) => `• ${p.name}`)
      .join('\n');

    let msg = `Merhaba, numune talebim:\n`;
    if (businessName.trim()) {
      msg += `İşletme: ${businessName.trim()}\n`;
    }
    msg += `İlçe: ${district}\n`;
    msg += `Ürünler:\n${selectedNames || '• Seçilen ürünler'}\n`;
    if (notes.trim()) {
      msg += `Not: ${notes.trim()}\n`;
    }
    return msg;
  };

  const handleSendWhatsApp = () => {
    const rawMsg = generateWhatsAppMessage();
    const encoded = encodeURIComponent(rawMsg);
    // WhatsApp direct API dispatch using exact phone 0533 647 55 18
    window.open(`https://api.whatsapp.com/send?phone=905336475518&text=${encoded}`, '_blank');
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    saveSampleRequestToSupabase({
      businessName: businessName.trim() || 'İşletme Belirtilmedi',
      contactName: businessName.trim() || 'Yetkili',
      phone: 'WhatsApp / Web',
      district: district,
      address: district + ', Bursa',
      businessType: 'Restoran',
      selectedProductIds: selectedIds,
      notes: notes.trim(),
    });
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-stone-800 flex flex-col">
      {/* Top Navigation Bar with Back Button */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Ana Sayfaya Dön</span>
            </button>
            <div className="hidden sm:block pl-2 border-l border-stone-200">
              <DeveciogluLogo variant="light" size="xs" showSubtitle={false} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-stone-500 font-medium">
              Doğrudan Numune Hattı:
            </span>
            <a
              href="tel:+905336475518"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-700" />
              <span>0533 647 55 18</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Main Card with Solid Opaque Background */}
          <div className="bg-white rounded-2xl border border-stone-300 shadow-xl overflow-hidden">
            
            {/* ÜSTTEKİ YEŞİL KISIM */}
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 text-white p-6 sm:p-8 relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Bursa İçi Restoran ve İmalatçılara Özel
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight text-white">
                  Ücretsiz Şef & Mutfak Numunesi Talebi
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/90 mt-1.5 max-w-2xl leading-relaxed">
                  Toptan alım öncesinde ceviz içi rengini, tane kalibresini ve fırında kararma dayanımını mutfağınızda test edin.
                </p>
              </div>

              {/* Quick Delivery Tag */}
              <div className="mt-5 pt-3.5 border-t border-emerald-800/80 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
                <span className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                  Bursa Merkez İlçelerine (Nilüfer, Osmangazi, Yıldırım) GÜN İÇİNDE TESLİMAT
                </span>
                <span className="hidden sm:inline text-emerald-600">·</span>
                <span className="text-stone-300">
                  Uzak İlçelere (Karacabey, Mudanya, Kestel) 1 - 3 Gün İçinde
                </span>
              </div>
            </div>

            {/* ALT KISIM */}
            <div className="p-6 sm:p-8 bg-white space-y-6">
              
              {/* Highlight Notice Banner: Gün içinde merkeze teslimat imkanı */}
              <div className="p-4 sm:p-5 bg-emerald-50/90 rounded-xl border border-emerald-300 flex items-start gap-3.5">
                <Truck className="w-6 h-6 text-emerald-800 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                  <strong className="block text-emerald-900 font-bold mb-1 text-sm sm:text-base">
                    Bursa Merkez İlçelerine Gün İçinde Ücretsiz Teslimat İmkanı
                  </strong>
                  Nilüfer, Osmangazi ve Yıldırım&apos;daki restoran, baklavacı ve pastanelere numuneler kendi araç filomuzla 
                  <strong> gün içinde</strong> teslim edilir. Karacabey, Mudanya ve Kestel bölgelerine ise haftalık rut düzenimize göre 
                  <strong> 1 - 3 gün içinde</strong> güvenle ulaştırılır.
                </div>
              </div>

              {/* BÜYÜK WHATSAPP İLETİŞİM BUTONU (Öncelikli & Belirgin) */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 to-stone-900 rounded-2xl text-white shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      En Hızlı İletişim Kanalı
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold font-['Plus_Jakarta_Sans']">
                      WhatsApp Satış Masası ile Hemen İletişime Geçin
                    </h3>
                    <p className="text-xs text-stone-300 mt-0.5">
                      Sevkiyat ekibimiz adresinize en yakın dağıtım aracını gün içinde yönlendirir.
                    </p>
                  </div>
                  <div className="text-xs text-stone-300 sm:text-right shrink-0">
                    <span className="block font-mono font-bold text-white text-sm">0533 647 55 18</span>
                    <span className="text-[11px] text-emerald-400">7/24 Mesaj İletimi</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-sm sm:text-base font-extrabold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer group"
                >
                  <MessageCircle className="w-6 h-6 fill-white text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span>WhatsApp ile Gün İçi Numune İste (0533 647 55 18)</span>
                  <ExternalLink className="w-4 h-4 text-emerald-200" />
                </button>
              </div>

              {submitted ? (
                <div className="py-10 text-center space-y-4 border border-emerald-200 bg-emerald-50/50 rounded-2xl p-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-stone-900 font-['Plus_Jakarta_Sans']">
                    Numune Talebiniz Başarıyla Kaydedildi!
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-700 max-w-lg mx-auto leading-relaxed">
                    Sayın <strong>{businessName.trim() || 'İşletme Yetkilisi'}</strong>, talebiniz Devecioğlu toptan sevkiyat masamıza ulaştı.{' '}
                    {isCentralDistrict ? (
                      <strong className="text-emerald-900 block mt-1">
                        Bursa merkez ilçe ({district}) adresinize GÜN İÇİNDE özel numune tadım kutunuz teslim edilecektir.
                      </strong>
                    ) : (
                      <span className="block mt-1">
                        ({district}) adresinize rut gününde (1 - 3 gün içinde) teslim edilecektir.
                      </span>
                    )}
                  </p>

                  <div className="pt-4 max-w-md mx-auto space-y-2.5">
                    <button
                      onClick={handleSendWhatsApp}
                      className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 fill-white" />
                      <span>WhatsApp Satış Hattına da Bildir (0533 647 55 18)</span>
                    </button>
                    <button
                      onClick={onBackToHome}
                      className="w-full py-2.5 text-xs text-stone-600 hover:text-stone-900 font-semibold cursor-pointer underline"
                    >
                      Kataloğa Geri Dön
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitForm} className="space-y-6 pt-2">
                  
                  {/* Categorized Product Selection */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <Boxes className="w-4 h-4 text-emerald-800" />
                        <span>Mutfakta Denemek İstediğiniz Ürünleri Seçin (En Fazla 3 Çeşit):</span>
                      </label>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 w-fit">
                        {selectedIds.length} / 3 Seçildi
                      </span>
                    </div>

                    {/* Selected Products Preview Chips */}
                    {selectedProducts.length > 0 && (
                      <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                        <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider block mb-1.5">
                          Seçtiğiniz Numuneler:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {selectedProducts.map((p) => (
                            <span
                              key={p.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-emerald-900 rounded-lg text-xs font-semibold border border-emerald-300 shadow-2xs"
                            >
                              <span>{p.name}</span>
                              <button
                                type="button"
                                onClick={() => removeProduct(p.id)}
                                className="text-stone-400 hover:text-rose-600 cursor-pointer"
                                title="Kaldır"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category Selector Tabs: Ceviz, Badem, Fındık, etc. */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200">
                      {sampleCategories.map((cat) => {
                        const isActive = activeCategoryTab === cat.id;
                        const countInCat = products.filter((p) => getProductCategory(p) === cat.id).length;

                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => setActiveCategoryTab(cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isActive
                                ? 'bg-emerald-800 text-white shadow-xs'
                                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
                            }`}
                          >
                            <span>{cat.label}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                              isActive ? 'bg-emerald-950 text-emerald-200' : 'bg-stone-200 text-stone-600'
                            }`}>
                              {countInCat}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Products Grid for Active Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto p-2 border border-stone-200 rounded-xl bg-stone-50">
                      {filteredProducts.length === 0 ? (
                        <div className="col-span-2 py-6 text-center text-xs text-stone-500">
                          Bu kategoride numune ürünü bulunamadı.
                        </div>
                      ) : (
                        filteredProducts.map((p) => {
                          const isSelected = selectedIds.includes(p.id);
                          const isDisabled = !isSelected && selectedIds.length >= 3;

                          return (
                            <button
                              type="button"
                              key={p.id}
                              onClick={() => toggleProduct(p.id)}
                              disabled={isDisabled}
                              className={`p-3 rounded-xl text-left transition-all border flex items-center justify-between gap-2.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-600'
                                  : isDisabled
                                  ? 'bg-stone-100 border-stone-200 text-stone-400 opacity-60 cursor-not-allowed'
                                  : 'bg-white border-stone-200 text-stone-700 hover:border-emerald-300 hover:bg-emerald-50/20'
                              }`}
                            >
                              <div className="min-w-0 pr-1">
                                <span className="block truncate text-xs font-semibold">{p.name}</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] text-stone-500 font-normal">
                                    {p.grade}
                                  </span>
                                  <span className="text-[10px] text-stone-400">·</span>
                                  <span className="text-[10px] text-emerald-700 font-medium">
                                    {p.origin}
                                  </span>
                                </div>
                              </div>
                              {isSelected ? (
                                <div className="w-5 h-5 rounded-md bg-emerald-700 text-white flex items-center justify-center shrink-0">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-md border border-stone-300 bg-white shrink-0" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Clean Form Inputs: Business Name & District Selection only (business type, contact name, address, phone removed as requested) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-stone-700 text-xs mb-1.5">
                        İşletme / Restoran / Pastane Adı
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-semibold text-stone-700 text-xs">
                          Bursa İlçesi *
                        </label>
                        {isCentralDistrict ? (
                          <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                            Gün İçinde Teslim Edilir
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                            1 - 3 Gün İçinde Teslim
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
                        >
                          <option value="Nilüfer">Nilüfer (Merkez · Gün İçi Teslimat)</option>
                          <option value="Osmangazi">Osmangazi (Merkez · Gün İçi Teslimat)</option>
                          <option value="Yıldırım">Yıldırım (Merkez · Gün İçi Teslimat)</option>
                          <option value="Mudanya">Mudanya (Merkez / Rut · Gün İçi Teslimat)</option>
                          <option value="Karacabey">Karacabey (1 - 3 Gün İçinde Teslim · Cuma)</option>
                          <option value="Kestel">Kestel (1 - 3 Gün İçinde Teslim · Perşembe)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Özel Şef Notu (Kutu içinde silik örnek metin tamamen kaldırıldı) */}
                  <div>
                    <label className="block font-semibold text-stone-700 text-xs mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Özel Şef Notu</span>
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 resize-none"
                    />
                  </div>

                  {/* Action Buttons: Direct WhatsApp Dispatch + Web Submit */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSendWhatsApp}
                      className="w-full sm:flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                      <span>Numune Talebini WhatsApp ile Gönder</span>
                    </button>

                    <button
                      type="submit"
                      className="w-full sm:w-auto py-3.5 px-6 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                    >
                      Web Formu Olarak Kaydet
                    </button>
                  </div>

                  <div className="text-[11px] text-stone-500 flex items-center justify-between border-t border-stone-200 pt-3">
                    <span>*Numunelerimiz işletmelere ücretsiz teslim edilir.</span>
                    <button
                      type="button"
                      onClick={onBackToHome}
                      className="text-stone-700 hover:text-emerald-800 font-semibold underline cursor-pointer"
                    >
                      Vazgeç & Kataloğa Dön
                    </button>
                  </div>

                </form>
              )}

            </div>

            {/* Bottom Strip */}
            <div className="p-4 bg-stone-100 border-t border-stone-200 text-xs text-stone-600 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
                <span>Devecioğlu Toptan Gıda · Bursa Gıda Toptancıları Sitesi B Blok</span>
              </div>
              <div className="font-mono text-stone-900 font-bold">
                Toptan & Numune İletişim: 0533 647 55 18
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};
