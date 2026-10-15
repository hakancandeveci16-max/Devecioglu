import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';
import { saveSampleRequestToSupabase } from '../lib/supabase';
import {
  X,
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
  FileText,
} from 'lucide-react';

interface SampleRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
  preSelectedProductId?: string;
}

export const SampleRequestModal: React.FC<SampleRequestModalProps> = ({
  isOpen,
  onClose,
  products = [],
  preSelectedProductId,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [district, setDistrict] = useState('Nilüfer');
  const [selectedIds, setSelectedIds] = useState<string[]>(
    preSelectedProductId ? [preSelectedProductId] : ['ceviz-baklavalik-elenmis-kirik', 'ceviz-ekstra-kelebek-sili']
  );
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('Ceviz');

  if (!isOpen) return null;

  const isCentralDistrict = ['Nilüfer', 'Osmangazi', 'Yıldırım', 'Mudanya'].includes(district);

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
    { id: 'Ceviz', label: 'Ceviz' },
    { id: 'Badem', label: 'Badem' },
    { id: 'Fındık', label: 'Fındık' },
    { id: 'Antep Fıstığı & Kaju', label: 'Fıstık & Kaju' },
    { id: 'Kuru Meyve', label: 'Kuru Meyve' },
  ];

  const availableProducts = products.length > 0 ? products : PRODUCTS;
  const filteredProducts = availableProducts.filter((p) => getProductCategory(p) === activeCategoryTab);
  const selectedProducts = availableProducts.filter((p) => selectedIds.includes(p.id));

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const removeProduct = (id: string) => {
    setSelectedIds((prev) => prev.filter((p) => p !== id));
  };

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
    // WhatsApp direct API dispatch
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
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Crisp Solid Dark Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-stone-300 isolate">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 text-white p-6 sm:p-7 relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Bursa İçi Restoran ve İmalatçılara Özel
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight">
                Ücretsiz Şef & Mutfak Numunesi Talebi
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-lg leading-relaxed">
                Toptan alım öncesinde ceviz içi rengini, tane kalibresini ve fırında kararma dayanımını mutfağınızda test edin.
              </p>
            </div>

            {/* Quick Delivery Tag */}
            <div className="mt-4 pt-3 border-t border-emerald-800/80 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
              <span className="flex items-center gap-1.5 font-bold text-amber-300">
                <Clock className="w-4 h-4 text-amber-300" />
                Bursa Merkez İlçelerine (Nilüfer, Osmangazi, Yıldırım) GÜN İÇİNDE TESLİMAT
              </span>
              <span className="hidden sm:inline text-emerald-600">·</span>
              <span className="text-stone-300">
                Uzak İlçelere (Karacabey, Mudanya, Kestel) 1 - 3 Gün İçinde
              </span>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-emerald-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer z-20"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-7 bg-white space-y-5">
            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-stone-900 font-['Plus_Jakarta_Sans']">
                  Numune Talebiniz Alındı!
                </h4>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Sayın <strong>{businessName.trim() || 'İşletme Yetkilisi'}</strong>, Devecioğlu toptan sevkiyat ekibimiz {isCentralDistrict ? 'Bursa merkez adresinize gün içinde' : 'rut gününde'} numuneleri ulaştıracaktır.
                </p>

                <div className="pt-3 max-w-sm mx-auto space-y-2">
                  <button
                    onClick={handleSendWhatsApp}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>WhatsApp Satış Hattına da Gönder (0533 647 55 18)</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-2 text-xs text-stone-500 hover:text-stone-800 font-medium cursor-pointer"
                  >
                    Pencereyi Kapat
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitForm} className="space-y-4">
                
                {/* Categorized Product Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-stone-800 flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-emerald-800" />
                      <span>Mutfakta Denemek İstediğiniz Ürünleri Seçin (En Fazla 3):</span>
                    </label>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {selectedIds.length} / 3 Seçildi
                    </span>
                  </div>

                  {/* Selected items chips */}
                  {selectedProducts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-emerald-50/70 rounded-lg border border-emerald-200">
                      {selectedProducts.map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-white text-emerald-900 rounded text-[11px] font-semibold border border-emerald-300"
                        >
                          <span className="truncate max-w-[150px]">{p.name}</span>
                          <button
                            type="button"
                            onClick={() => removeProduct(p.id)}
                            className="text-stone-400 hover:text-rose-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Category Filter Tabs */}
                  <div className="flex flex-wrap gap-1 p-1 bg-stone-100 rounded-lg border border-stone-200">
                    {sampleCategories.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setActiveCategoryTab(cat.id)}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          activeCategoryTab === cat.id
                            ? 'bg-emerald-800 text-white shadow-2xs'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1.5 border border-stone-200 rounded-xl bg-stone-50">
                    {filteredProducts.map((p) => {
                      const isSelected = selectedIds.includes(p.id);
                      const isDisabled = !isSelected && selectedIds.length >= 3;

                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => toggleProduct(p.id)}
                          disabled={isDisabled}
                          className={`p-2.5 rounded-lg text-left transition-all border flex items-center justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-xs'
                              : isDisabled
                              ? 'bg-stone-100 border-stone-200 text-stone-400 opacity-60 cursor-not-allowed'
                              : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                          }`}
                        >
                          <div className="truncate">
                            <span className="block truncate text-xs">{p.name}</span>
                            <span className="text-[10px] text-stone-500 font-normal">
                              {p.grade} · {p.origin}
                            </span>
                          </div>
                          {isSelected ? (
                            <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded border border-stone-300 bg-white shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form Inputs: Only Business Name and District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      İşletme / Restoran Adı
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-stone-700">
                        Bursa İlçesi *
                      </label>
                      {isCentralDistrict ? (
                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                          Gün İçinde Teslim
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded">
                          1 - 3 Gün İçinde
                        </span>
                      )}
                    </div>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    >
                      <option value="Nilüfer">Nilüfer (Merkez · Gün İçi Teslimat)</option>
                      <option value="Osmangazi">Osmangazi (Merkez · Gün İçi Teslimat)</option>
                      <option value="Yıldırım">Yıldırım (Merkez · Gün İçi Teslimat)</option>
                      <option value="Mudanya">Mudanya (Merkez · Gün İçi Teslimat)</option>
                      <option value="Karacabey">Karacabey (1 - 3 Gün İçinde Teslim)</option>
                      <option value="Kestel">Kestel (1 - 3 Gün İçinde Teslim)</option>
                    </select>
                  </div>
                </div>

                {/* Özel Şef Notu (No placeholder text) */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Özel Şef Notu (İsteğe Bağlı)</span>
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                {/* PRIMARY BIG WHATSAPP CONTACT BUTTON */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                    <span>WhatsApp ile Gün İçi Numune İste (0533 647 55 18)</span>
                    <ExternalLink className="w-4 h-4 text-emerald-200" />
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 px-1 pt-1 border-t border-stone-200">
                    <span>*Devecioğlu Toptan Gıda · Bursa Merkez Gün İçi Teslim</span>
                    <button
                      type="submit"
                      className="text-stone-700 font-semibold hover:text-emerald-800 cursor-pointer underline"
                    >
                      Web Kaydı Oluştur
                    </button>
                  </div>
                </div>

              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
