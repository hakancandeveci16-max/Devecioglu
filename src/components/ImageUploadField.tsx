import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Check, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { WALNUT_IMAGE, NUTS_IMAGE, DRIED_FRUITS_IMAGE } from '../data/products';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (dataUrlOrUrl: string) => void;
  helperText?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  helperText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Compress and convert image file to lightweight Base64 Data URL
  const processImageFile = (file: File) => {
    setErrorMessage('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Lütfen geçerli bir resim dosyası seçin (PNG, JPG, WEBP).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();

      img.onload = () => {
        try {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.88);
            onChange(compressed);
          } else {
            onChange(rawDataUrl);
          }
        } catch {
          onChange(rawDataUrl);
        } finally {
          setIsProcessing(false);
        }
      };

      img.onerror = () => {
        onChange(rawDataUrl);
        setIsProcessing(false);
      };

      img.src = rawDataUrl;
    };

    reader.onerror = () => {
      setErrorMessage('Dosya okunurken bir sorun oluştu.');
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // reset input so the same file can be re-selected if deleted
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const isLocalUpload = value?.startsWith('data:image/');

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <label className="block font-semibold text-stone-700">{label}</label>
        {helperText && <span className="text-[11px] text-stone-500">{helperText}</span>}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Upload / Preview Container */}
      <div className="space-y-2.5">
        {/* If Image exists: Display rich preview with management actions */}
        {value ? (
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-24 h-24 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-stone-300 bg-white shrink-0 shadow-2xs group">
              <img
                src={value}
                alt="Ürün Fotoğrafı"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-1 text-center sm:text-left w-full">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                {isLocalUpload ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    <Check className="w-3 h-3 text-emerald-700" />
                    Bilgisayarınızdan Yüklendi
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-200 px-2 py-0.5 rounded-md">
                    <ImageIcon className="w-3 h-3" />
                    Harici URL / Hazır Görsel
                  </span>
                )}
                {isProcessing && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    <RefreshCw className="w-3 h-3 animate-spin" /> İşleniyor...
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 line-clamp-1">
                {isLocalUpload
                  ? 'Fotoğraf optimize edildi ve kataloğa kaydedilmeye hazır.'
                  : value}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Bilgisayardan Değiştir</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-stone-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-stone-600 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  title="Fotoğrafı Kaldır"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Kaldır</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Dropzone when no image is selected */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`p-5 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-600 bg-emerald-50/70 scale-[0.99]'
                : 'border-stone-300 bg-stone-50 hover:bg-emerald-50/40 hover:border-emerald-400'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2 shadow-2xs">
              <Upload className="w-5 h-5" />
            </div>
            <div className="font-bold text-stone-900 text-xs sm:text-sm">
              Bilgisayarınızdan Fotoğraf Yükleyin
            </div>
            <p className="text-[11px] text-stone-500 mt-1 max-w-sm mx-auto">
              Fotoğrafı seçmek için buraya tıklayın veya dosyanızı buraya sürükleyip bırakın.
            </p>
            <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 bg-white border border-stone-200 text-emerald-800 rounded-md text-[11px] font-bold shadow-2xs">
              <span>PNG, JPG, WEBP desteklenir (Otomatik Optimize Edilir)</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="text-[11px] text-rose-600 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
            {errorMessage}
          </div>
        )}

        {/* Alternative: Enter URL or pick standard preset photos */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-stone-500 hover:text-emerald-800 inline-flex items-center gap-1 font-medium cursor-pointer"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showUrlInput ? 'URL Girişini Gizle' : 'Veya hazır görsel seç / Web URL gir'}</span>
          </button>

          {showUrlInput && (
            <div className="mt-2 p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
              <input
                type="text"
                placeholder="https://example.com/resim.jpg"
                value={isLocalUpload ? '' : value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono"
              />
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-600">
                <span className="font-semibold text-stone-700">Hazır Görseller:</span>
                <button
                  type="button"
                  onClick={() => onChange(WALNUT_IMAGE)}
                  className="px-2 py-0.5 bg-white border border-stone-200 rounded hover:bg-stone-100 hover:text-emerald-800 cursor-pointer"
                >
                  Ceviz İçi
                </button>
                <button
                  type="button"
                  onClick={() => onChange(NUTS_IMAGE)}
                  className="px-2 py-0.5 bg-white border border-stone-200 rounded hover:bg-stone-100 hover:text-emerald-800 cursor-pointer"
                >
                  Kuruyemiş
                </button>
                <button
                  type="button"
                  onClick={() => onChange(DRIED_FRUITS_IMAGE)}
                  className="px-2 py-0.5 bg-white border border-stone-200 rounded hover:bg-stone-100 hover:text-emerald-800 cursor-pointer"
                >
                  Kuru Meyve
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
