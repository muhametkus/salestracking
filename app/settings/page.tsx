"use client";

import React, { useState } from "react";
import { useNotification } from "@/components/UI/NotificationContext";
import { Copy, Check, Save } from "lucide-react";

export default function SettingsPage() {
  const { success } = useNotification();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // SMS Gateway state
  const [smsProvider, setSmsProvider] = useState("netgsm");
  const [smsHeader, setSmsHeader] = useState("FIRMAADI");
  const [smsApiKey, setSmsApiKey] = useState("");

  // Company info state
  const [companyName, setCompanyName] = useState("SalesTracking Mobilya & Tasarım A.Ş.");
  const [companyPhone, setCompanyPhone] = useState("+90 532 000 00 00");
  const [companyEmail, setCompanyEmail] = useState("info@firmaniz.com");
  const [companyAddress, setCompanyAddress] = useState("Organize Sanayi Bölgesi 1. Cadde No: 42, İstanbul");

  const copyTemplate = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    success("Şablon panoya kopyalandı!");
    setTimeout(() => setCopiedKey(null), 3000);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    success("Firma bilgileri kaydedildi.");
  };

  const handleSaveSms = (e: React.FormEvent) => {
    e.preventDefault();
    success("SMS servisi ayarları kaydedildi (Aktif bildirim: WhatsApp).");
  };

  const statusDefinitions = [
    {
      name: "Oluşturuldu",
      dotColor: "bg-slate-500",
      description: "Teklif onaylandıktan veya manuel girildikten sonra sisteme ilk düşen başlangıç sipariş kaydıdır.",
    },
    {
      name: "Üretimde",
      dotColor: "bg-amber-500",
      description: "Üretim gerektiren mobilya, dolap ve özel imalat kalemlerinin atölyede imalat sürecine girdiği aşamadır.",
    },
    {
      name: "Üretildi",
      dotColor: "bg-teal-500",
      description: "İmalatı tamamlanan, kalite testlerinden geçmiş ve sevkiyata hazır ürünlerin durumudur.",
    },
    {
      name: "Tedarik Edildi",
      dotColor: "bg-cyan-500",
      description: "Harici tedarikçilerden veya boyahaneden temin edilen parçaların depoya giriş yaptığı durumdur.",
    },
    {
      name: "Teslimat Bekliyor",
      dotColor: "bg-blue-500",
      description: "Tüm ürünleri hazır siparişin nakliye ve araç rotalama bekleme durumudur.",
    },
    {
      name: "Montaj Günü Bekleniyor",
      dotColor: "bg-purple-500",
      description: "Montaj Dahil ürünler için müşteriyle randevu gününün netleştirildiği aşamadır.",
    },
    {
      name: "Montaj Planlandı",
      dotColor: "bg-indigo-500",
      description: "Montaj ekibi, gün ve saat ataması takvime işlenmiş aşamadır.",
    },
    {
      name: "Tamamlandı",
      dotColor: "bg-emerald-500",
      description: "Teslimatı ve montajı eksiksiz tamamlanmış, tahsilatları alınarak kapatılmış sipariştir.",
    },
    {
      name: "İptal Edildi",
      dotColor: "bg-rose-500",
      description: "Müşteri veya firma tarafından operasyonu durdurulmuş sipariştir.",
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
          Sistem ve Süreç Ayarları
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Sipariş iş akış durumları, WhatsApp bildirim şablonları ve kurumsal firma tanımları
        </p>
      </div>

      {/* Section 1: Order Status Workflow */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Sipariş Durumları & Operasyonel İş Akışı
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Siparişlerin adım adım ilerlediği tanımlı süreçler ve açıklamaları
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {statusDefinitions.map((item) => (
            <div
              key={item.name}
              className="p-3.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.dotColor} shrink-0`} />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {item.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: WhatsApp Messages & Templates */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            WhatsApp Bildirim Şablonları
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Müşterilere gönderilen otomatik hazır mesaj metinleri
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Template 1 */}
          <div className="p-3.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span>Teklif Onay Linki</span>
                <span className="text-[10px] text-blue-600 font-medium">Teklifler</span>
              </div>
              <div className="mt-2 p-2.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
{`Sayın {Müşteri Adı},
{Teklif No} numaralı teklifiniz hazırlanmıştır.
Teklifi incelemek ve onaylamak için:
{Onay Linki}
Sorularınız için bize yazabilirsiniz.`}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                copyTemplate(
                  "quote",
                  "Sayın {Müşteri Adı},\n{Teklif No} numaralı teklifiniz hazırlanmıştır.\nTeklifi incelemek ve onaylamak için:\n{Onay Linki}\nSorularınız için bize yazabilirsiniz."
                )
              }
              className="w-full py-1.5 rounded border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedKey === "quote" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "quote" ? "Kopyalandı" : "Metni Kopyala"}</span>
            </button>
          </div>

          {/* Template 2 */}
          <div className="p-3.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span>Bakiye Hatırlatması</span>
                <span className="text-[10px] text-emerald-600 font-medium">Siparişler</span>
              </div>
              <div className="mt-2 p-2.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
{`Sayın {Müşteri Adı},
{Sipariş No} numaralı siparişinize ait bakiye durumu:
Toplam Tutar: {Toplam} ₺
Yapılan Ödeme: {Ödenen} ₺
Kalan Bakiye: {Kalan} ₺
Dekontunuzu iletebilirsiniz.`}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                copyTemplate(
                  "payment",
                  "Sayın {Müşteri Adı},\n{Sipariş No} numaralı siparişinize ait bakiye durumu:\nToplam Tutar: {Toplam} ₺\nYapılan Ödeme: {Ödenen} ₺\nKalan Bakiye: {Kalan} ₺\nDekontunuzu iletebilirsiniz."
                )
              }
              className="w-full py-1.5 rounded border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedKey === "payment" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "payment" ? "Kopyalandı" : "Metni Kopyala"}</span>
            </button>
          </div>

          {/* Template 3 */}
          <div className="p-3.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span>Canlı Sipariş Takip</span>
                <span className="text-[10px] text-indigo-600 font-medium">Takip Linki</span>
              </div>
              <div className="mt-2 p-2.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
{`Sayın {Müşteri Adı},
{Sipariş No} numaralı siparişinizin durumu "{Durum}" olarak güncellenmiştir.
Siparişinizi anlık takip etmek için:
{Takip Linki}
İyi günler dileriz.`}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                copyTemplate(
                  "status",
                  "Sayın {Müşteri Adı},\n{Sipariş No} numaralı siparişinizin durumu \"{Durum}\" olarak güncellenmiştir.\nSiparişinizi anlık takip etmek için:\n{Takip Linki}\nİyi günler dileriz."
                )
              }
              className="w-full py-1.5 rounded border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedKey === "status" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "status" ? "Kopyalandı" : "Metni Kopyala"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: SMS Gateway Settings */}
      <form
        onSubmit={handleSaveSms}
        className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              SMS Servisi Entegrasyonu
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              İsteğe bağlı SMS sağlayıcı ayarları (Şu an aktif kanal: WhatsApp)
            </p>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Opsiyonel
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Sağlayıcı
            </label>
            <select
              value={smsProvider}
              onChange={(e) => setSmsProvider(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="netgsm">Netgsm</option>
              <option value="iletimerkezi">İletiMerkezi</option>
              <option value="mutlucell">Mutlucell</option>
              <option value="twilio">Twilio</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Başlık (Header)
            </label>
            <input
              type="text"
              value={smsHeader}
              onChange={(e) => setSmsHeader(e.target.value)}
              placeholder="Örn: MOBILYA"
              className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              API Anahtarı
            </label>
            <input
              type="password"
              value={smsApiKey}
              onChange={(e) => setSmsApiKey(e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>SMS Ayarlarını Kaydet</span>
          </button>
        </div>
      </form>

      {/* Section 4: Company Profile */}
      <form
        onSubmit={handleSaveCompany}
        className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 space-y-3"
      >
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Kurumsal Firma Bilgileri
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            PDF çıktılarında ve bildirim başlıklarında görüntülenecek resmi bilgiler
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Firma Ünvanı
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Firma Telefonu (WhatsApp)
            </label>
            <input
              type="text"
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              E-posta
            </label>
            <input
              type="email"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Adres
            </label>
            <input
              type="text"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Firma Bilgilerini Kaydet</span>
          </button>
        </div>
      </form>
    </div>
  );
}
