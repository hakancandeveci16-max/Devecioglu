import React, { useState } from 'react';
import { CartItem } from '../types';
import {
  X,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  Copy,
  Check,
  Building2,
  Phone,
  MapPin,
  Send,
  Eye,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface QuoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantityKg: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const QuoteDrawer: React.FC<QuoteDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Nilüfer');
  const [deliveryPreference, setDeliveryPreference] = useState('Haftalık Düzenli Rut Teslimatı');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  const totalKg = cart.reduce((acc, item) => acc + item.quantityKg, 0);
  const totalMinPrice = cart.reduce((acc, item) => acc + item.quantityKg * item.product.minPrice, 0);
  const totalMaxPrice = cart.reduce((acc, item) => acc + item.quantityKg * item.product.maxPrice, 0);

  // Devecioğlu sales representative official WhatsApp phone
  const SALES_REP_PHONE = '905336475518'; // 0533 647 55 18

  // Format professional WhatsApp B2B message
  const formatWhatsAppMessage = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    let msg = `*DEVECİOĞLU TOPTAN GIDA TİCARETİ*\n`;
    msg += `*Bursa B2B Toptan Fiyat Teklif Talebi*\n`;
    msg += `_Tarih: ${dateStr} - ${timeStr}_\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    msg += `🏢 *İŞLETME BİLGİLERİ:*\n`;
    msg += `• *İşletme:* ${businessName.trim() || 'Belirtilmedi'}\n`;
    if (contactName.trim()) msg += `• *Yetkili / Şef:* ${contactName.trim()}\n`;
    msg += `• *İletişim Tel:* ${phone.trim() || 'Belirtilmedi'}\n`;
    msg += `• *Bursa İlçesi:* ${district}\n`;
    msg += `• *Teslimat Tercihi:* ${deliveryPreference}\n\n`;

    msg += `📦 *TALEP EDİLEN ÜRÜN LİSTESİ:*\n`;
    cart.forEach((item, index) => {
      const itemMin = item.quantityKg * item.product.minPrice;
      const itemMax = item.quantityKg * item.product.maxPrice;
      msg += `*${index + 1}) ${item.product.name}*\n`;
      msg += `   └ Miktar: *${item.quantityKg} kg* (${item.product.packaging})\n`;
      msg += `   └ Sınıf & Menşei: ${item.product.grade} · ${item.product.origin}\n`;
      msg += `   └ Gösterge Fiyat: ${item.product.indicativePriceRange}\n`;
      msg += `   └ Tahmini Tutar: ~${itemMin.toLocaleString('tr-TR')} - ${itemMax.toLocaleString('tr-TR')} ₺\n\n`;
    });

    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📊 *TOPLAM TALEP:* *${totalKg} kg* (${cart.length} Kalem Ürün)\n`;
    msg += `💰 *GÖSTERGE BÜTÇE:* *${totalMinPrice.toLocaleString('tr-TR')} ₺ - ${totalMaxPrice.toLocaleString('tr-TR')} ₺*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (notes.trim()) {
      msg += `📝 *ÖZEL İSTEK / MUTFAK NOTU:*\n"${notes.trim()}"\n\n`;
    }

    msg += `_İşletmemizin aylık düzenli tüketim miktarına ve Bursa içi sevkiyat rutunuza göre Devecioğlu yetkilisinden net toptan koli/kg teklifimizi rica ederiz._`;
    return msg;
  };

  const handleSendViaWhatsAppApi = () => {
    const message = formatWhatsAppMessage();
    const encoded = encodeURIComponent(message);
    // WhatsApp direct API link (opens WhatsApp Web on desktop, native app on mobile)
    const directApiUrl = `https://api.whatsapp.com/send?phone=${SALES_REP_PHONE}&text=${encoded}`;
    window.open(directApiUrl, '_blank');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(formatWhatsAppMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitWeb = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Devecioğlu Satış Masası
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-semibold">
                  WhatsApp API Entegre
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-stone-900 font-['Plus_Jakarta_Sans'] mt-0.5">
                Ürüne Özel Toptan Teklif Sepeti
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-stone-900">Teklif Talebiniz Alındı!</h3>
                <p className="text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                  Sayın <strong>{businessName || 'İşletme Yetkilisi'}</strong>, talebiniz Bursa toptan satış masamıza ulaştı. 
                  Görüşmeyi hemen başlatmak için temsilcimize WhatsApp üzerinden de gönderebilirsiniz:
                </p>
                <div className="pt-4 flex flex-col gap-2">
                  <button
                    onClick={handleSendViaWhatsAppApi}
                    className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <MessageCircle className="w-5 h-5 text-white" />
                    <span>WhatsApp Satış Temsilcisine Hemen İlet</span>
                    <ExternalLink className="w-4 h-4 opacity-75" />
                  </button>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      onClearCart();
                      onClose();
                    }}
                    className="w-full py-2.5 text-xs text-stone-600 hover:text-stone-900 underline font-semibold cursor-pointer"
                  >
                    Pencereyi Kapat & Yeni Sipariş
                  </button>
                </div>
              </div>
            ) : cart.length === 0 ? (
              <div className="py-16 text-center text-stone-500 space-y-3">
                <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                  <Building2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-stone-800">Teklif listeniz henüz boş</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  İhtiyacınız olan seçme ithal ceviz içi veya kuruyemişleri katalogdan ekleyip tek tıkla WhatsApp teklifi isteyebilirsiniz.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  Kataloğa Göz At
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                    <span>Seçilen Ürün Kalemleri ({cart.length})</span>
                    <button
                      onClick={onClearCart}
                      className="text-stone-400 hover:text-rose-600 transition-colors font-medium text-[11px] cursor-pointer"
                    >
                      Tümünü Temizle
                    </button>
                  </div>

                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-all flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-emerald-800 font-semibold truncate">
                          {item.product.grade} · {item.product.origin}
                        </div>
                        <h4 className="text-sm font-bold text-stone-900 truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-xs font-mono text-stone-600 mt-0.5 tabular-nums">
                          Bant: {item.product.indicativePriceRange}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-1">
                          Ambalaj: {item.product.packaging}
                        </div>
                      </div>

                      {/* Stepper & Remove */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                          title="Sil"
                          aria-label="Ürünü Listeden Çıkar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5 border border-stone-200">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, Math.max(item.product.minOrderKg, item.quantityKg - 10))}
                            className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-white rounded transition-colors cursor-pointer"
                            aria-label="Miktarı Azalt"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold font-mono px-2 tabular-nums">
                            {item.quantityKg} kg
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantityKg + 10)}
                            className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-white rounded transition-colors cursor-pointer"
                            aria-label="Miktarı Artır"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals Summary Card */}
                <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 space-y-2">
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Toplam Talep Miktarı:</span>
                    <strong className="text-stone-900 font-bold tabular-nums">{totalKg} kg</strong>
                  </div>
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Gösterge Bütçe Bandı:</span>
                    <span className="font-bold text-stone-900 font-mono tabular-nums">
                      {totalMinPrice.toLocaleString('tr-TR')} ₺ - {totalMaxPrice.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                  <div className="pt-2 border-t border-stone-200 text-[11px] text-emerald-800 flex items-center justify-between">
                    <span>*Ürüne ve sipariş tonajına özel net koli/kg iskontosu iletilir.</span>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-stone-600 hover:text-stone-900 flex items-center gap-1 font-semibold underline cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{showPreview ? 'Önizlemeyi Gizle' : 'Mesajı Önizle'}</span>
                    </button>
                  </div>
                </div>

                {/* Optional Message Preview Box */}
                {showPreview && (
                  <div className="p-3.5 bg-stone-900 text-stone-200 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto border border-stone-700">
                    {formatWhatsAppMessage()}
                  </div>
                )}

                {/* Business Info Form */}
                <form onSubmit={handleSubmitWeb} className="space-y-3 pt-1">
                  <div className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center justify-between">
                    <span>İşletme Bilgileri</span>
                    <span className="text-[11px] text-emerald-800 font-semibold lowercase">
                      (WhatsApp mesajına eklenir)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      İşletme / Restoran / Pastane Adı *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Örn: Asude Baklavaları & Şarküteri"
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Yetkili Kişi
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Ad Soyad"
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Telefon Numarası *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="05XX XXX XX XX"
                          className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Bursa İlçesi
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                        >
                          <option value="Nilüfer">Nilüfer (Salı & Cuma)</option>
                          <option value="Osmangazi">Osmangazi (3 Gün Rut)</option>
                          <option value="Yıldırım">Yıldırım (Pzt & Per)</option>
                          <option value="İnegöl">İnegöl (Perşembe)</option>
                          <option value="Mudanya & Gemlik">Mudanya & Gemlik</option>
                          <option value="Gürsu & Kestel">Gürsu & Kestel</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Teslimat Tercihi
                      </label>
                      <select
                        value={deliveryPreference}
                        onChange={(e) => setDeliveryPreference(e.target.value)}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      >
                        <option value="Haftalık Düzenli Rut Teslimatı">Haftalık Rut Dağıtım</option>
                        <option value="Önce Numune Gönderimi İstiyoruz">Önce Numune Talebi</option>
                        <option value="Depodan Doğrudan Teslim Alacağız">Depodan Alım (Acil)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Özel İstek / Mutfak Notu (İsteğe Bağlı)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Örn: Baklava imalatında denemek için numune de rica ederiz"
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  {/* WhatsApp Direct Action Area */}
                  <div className="pt-4 space-y-2.5">
                    
                    {/* Primary Button: WhatsApp Üzerinden Teklif Al (API Entegre) */}
                    <button
                      type="button"
                      onClick={handleSendViaWhatsAppApi}
                      className="w-full py-4 px-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-extrabold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 group"
                    >
                      <MessageCircle className="w-5 h-5 text-white fill-white group-hover:scale-110 transition-transform" />
                      <span>WhatsApp Üzerinden Teklif Al</span>
                      <ExternalLink className="w-4 h-4 text-emerald-200" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyText}
                        className="flex-1 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Metni Kopyala"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Mesaj Panoya Kopyalandı' : 'Formatlanmış Metni Kopyala'}</span>
                      </button>

                      <button
                        type="submit"
                        className="py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-stone-300" />
                        <span>Web Formu</span>
                      </button>
                    </div>

                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200/80 text-[11px] text-emerald-900 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>
                        Butona tıkladığınızda ürünler, miktarlar ve işletme bilgileriniz WhatsApp API ile otomatik hazır mesaj olarak Devecioğlu satış hattına açılır.
                      </span>
                    </div>

                  </div>
                </form>
              </>
            )}

          </div>

          {/* Footer note */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500 text-center flex items-center justify-between">
            <span>Devecioğlu Toptan Satış Masası</span>
            <span className="font-mono text-stone-700">Tel: 0533 647 55 18</span>
          </div>

        </div>
      </div>
    </div>
  );
};
