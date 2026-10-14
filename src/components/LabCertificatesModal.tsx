import React from 'react';
import { X, ShieldCheck, CheckCircle2, FileText, Download, Award, Building, Sparkles } from 'lucide-react';
import { LAB_ANALYSIS_DATA, LAB_CERT_IMAGE } from '../data/products';

interface LabCertificatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSample: () => void;
}

export const LabCertificatesModal: React.FC<LabCertificatesModalProps> = ({
  isOpen,
  onClose,
  onRequestSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        <div className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-stone-200">
          
          {/* Header */}
          <div className="bg-stone-900 text-white p-6 flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Resmi Akredite Laboratuvar Raporu
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-['Plus_Jakarta_Sans']">
                İstanbul Aydın Kuruyemiş Kalite & Analiz Belgeleri
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 mt-1">
                Devecioğlu Toptan Gıda bünyesindeki tüm ithal ceviz içi ve kuruyemiş partilerinin resmi gıda güvenlik belgeleri.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            
            {/* Accreditation Badge */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  ISO
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    {LAB_ANALYSIS_DATA.accreditation}
                  </h4>
                  <p className="text-xs text-emerald-800">
                    {LAB_ANALYSIS_DATA.distributorPartner}
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 bg-white text-emerald-800 rounded border border-emerald-200">
                Parti Bazlı Tam Onaylı
              </span>
            </div>

            {/* Visual Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                <img
                  src={LAB_CERT_IMAGE}
                  alt="Laboratuvar İnceleme"
                  className="w-full h-full object-cover min-h-[140px]"
                />
              </div>
              <div className="sm:col-span-2 p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Özet Analiz Sonucu
                  </span>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    İthal ceviz içi ve kuruyemişlerimiz, ithalat gümrük girişinden Devecioğlu Bursa deposuna kadar soğuk zincir ve nem kontrollü ambalajlarda korunmakta; oksidasyon (acılaşma) ve aflatoksin kontrolleri HPLC kromotografi cihazları ile yapılmaktadır.
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
                  <span>Peroksit Değeri: <strong>&lt; 0.15 meq/kg</strong></span>
                  <span>Kelebek Oranı: <strong>%90+ Seçme Bütün</strong></span>
                </div>
              </div>
            </div>

            {/* Test Details Table */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-stone-900 font-['Plus_Jakarta_Sans']">
                Temel Laboratuvar Parametreleri & Sınır Değerler
              </h4>
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-3">Test / Analiz Adı</th>
                      <th className="py-2.5 px-3">Standart Metot</th>
                      <th className="py-2.5 px-3">Bulunan Değer</th>
                      <th className="py-2.5 px-3 text-right">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-600">
                    {LAB_ANALYSIS_DATA.certificates.map((item, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/70">
                        <td className="py-2.5 px-3 font-semibold text-stone-900">{item.title}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{item.standard}</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-800">{item.result}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" />
                            Uygun
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Standards List */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
                Uluslararası Kalite & Gıda Güvenliği Sertifikaları
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                {LAB_ANALYSIS_DATA.managementStandards.map((std, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{std}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-stone-500">
              İşletmeniz için resmi analiz sertifikası koli sevkiyatıyla birlikte teslim edilir.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onRequestSample();
                }}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Analizli Numune Talep Et
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
