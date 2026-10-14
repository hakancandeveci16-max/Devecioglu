import React, { useState } from 'react';
import { Product } from '../types';
import { X, Check, ShieldCheck, Plus, Minus, Building, Sparkles } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantityKg: number) => void;
  onRequestSampleForProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onRequestSampleForProduct,
}) => {
  const [quantityKg, setQuantityKg] = useState<number>(product?.minOrderKg || 10);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantityKg);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        <div className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-stone-200">
          
          {/* Header */}
          <div className="relative h-64 bg-stone-900 overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent p-6 flex flex-col justify-end text-white">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <span>{product.origin}</span>
                <span>·</span>
                <span>{product.grade}</span>
                <span>·</span>
                <span>Aydın Kuruyemiş Tescilli</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-['Plus_Jakarta_Sans'] mt-1">
                {product.name}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-stone-950/70 hover:bg-stone-900 text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            
            {/* Description */}
            <p className="text-sm text-stone-700 leading-relaxed">
              {product.description}
            </p>

            {/* Price Band Banner */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-stone-500 uppercase tracking-wider block font-semibold">
                  Gösterge Toptan Fiyat Bandı
                </span>
                <div className="text-xl font-extrabold text-stone-900 font-mono tracking-tight tabular-nums">
                  {product.indicativePriceRange}
                </div>
                <div className="text-xs text-emerald-800 mt-0.5">
                  *Ürünün kalibre, kalite sınıfı ve tonajına göre ürüne özel net toptan fiyat verilir.
                </div>
              </div>
              <div className="text-xs text-stone-600 sm:text-right">
                <div>Minimum Sipariş: <strong>{product.minOrderText}</strong></div>
                <div>Ambalaj: <strong>{product.packaging}</strong></div>
              </div>
            </div>

            {/* Specs Table */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-150">
                <span className="text-stone-500 block">Menşei:</span>
                <strong className="text-stone-900 font-semibold">{product.origin}</strong>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-150">
                <span className="text-stone-500 block">Kalite Sınıfı:</span>
                <strong className="text-stone-900 font-semibold">{product.grade}</strong>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-150">
                <span className="text-stone-500 block">Renk Standardı:</span>
                <strong className="text-stone-900 font-semibold">{product.colorGrade}</strong>
              </div>
            </div>

            {/* Key Features */}
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                Öne Çıkan Kalite Standartları
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                {product.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Best For */}
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                Tavsiye Edilen Kullanım Alanları
              </h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {product.bestFor.map((bf, idx) => (
                  <span key={idx} className="px-3 py-1 bg-stone-100 text-stone-800 rounded-lg font-medium">
                    {bf}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Modal Footer / Quantity & Action */}
          <div className="p-6 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Stepper */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-xs font-medium text-stone-600">Teklif Miktarı:</span>
              <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-1">
                <button
                  onClick={() => setQuantityKg((q) => Math.max(product.minOrderKg, q - 10))}
                  className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded cursor-pointer"
                  aria-label="Azalt"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold font-mono px-3 tabular-nums">
                  {quantityKg} kg
                </span>
                <button
                  onClick={() => setQuantityKg((q) => q + 10)}
                  className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded cursor-pointer"
                  aria-label="Artır"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  onClose();
                  onRequestSampleForProduct(product);
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Numune İste
              </button>

              <button
                onClick={handleAdd}
                className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  added
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-900 hover:bg-emerald-800 text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Sepete Eklendi!</span>
                  </>
                ) : (
                  <span>Teklife Ekle ({quantityKg} kg)</span>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
