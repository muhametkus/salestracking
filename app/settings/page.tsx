"use client";

import React, { useState } from "react";
import { useNotification } from "@/components/UI/NotificationContext";
import {
  Settings,
  Layers,
  MessageCircle,
  Smartphone,
  Building2,
  Clock,
  Hammer,
  CheckCircle2,
  Package,
  Truck,
  Calendar,
  Wrench,
  ShieldCheck,
  XCircle,
  Copy,
  Check,
  Save,
  Info,
} from "lucide-react";

export default function SettingsPage() {
  const { success } = useNotification();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // SMS Gateway state (ready for future hookup)
  const [smsProvider, setSmsProvider] = useState("netgsm");
  const [smsHeader, setSmsHeader] = useState("FIRMAADI");
  const [smsApiKey, setSmsApiKey] = useState("");
  const [smsActive, setSmsActive] = useState(false);

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
    success("Firma bilgileri başarıyla kaydedildi.");
  };

  const handleSaveSms = (e: React.FormEvent) => {
    e.preventDefault();
    success("SMS servisi ayarları kaydedildi (Şu an aktif bildirim yöntemi: WhatsApp).");
  };

  const statusDefinitions = [
    {
      name: "Oluşturuldu",
      icon: Clock,
      color: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
      description: "Teklif onaylandıktan veya manuel olarak girildikten sonra sisteme ilk düşen başlangıç sipariş kaydıdır.",
    },
    {
      name: "Üretimde",
      icon: Hammer,
      color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
      description: "Üretim gerektiren mobilya, dolap ve özel imalat kalemlerinin atölye/fabrikada üretim sürecine girdiği aşamadır.",
    },
    {
      name: "Üretildi",
      icon: CheckCircle2,
      color: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
      description: "İmalatı tamamlanan, kalite kontrol testlerinden geçmiş ve sevkiyata hazır hale getirilen ürünlerin durumudur.",
    },
    {
      name: "Tedarik Edildi",
      icon: Package,
      color: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800",
      description: "Harici tedarikçilerden, boyahaneden veya kumaşçılardan temin edilen parçaların depoya giriş yaptığı durumdur.",
    },
    {
      name: "Teslimat Bekliyor",
      icon: Truck,
      color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
      description: "Tüm ürünleri hazır olan siparişin, müşteri adresine nakliyesi için araç rotalama ve sevkiyat bekleme durumudur.",
    },
    {
      name: "Montaj İçin Gün Verilecek",
      icon: Calendar,
      color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
      description: "Montaj Dahil ürünler için müşteriyle iletişime geçilip uygun randevu gününün netleştirildiği aşamadır.",
    },
    {
      name: "Montaj Planlandı",
      icon: Wrench,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
      description: "Montaj ekibi, gün ve saat ataması kesinleştirilmiş, takvime işlenmiş sipariş aşamasıdır.",
    },
    {
      name: "Sipariş Tamamlandı",
      icon: ShieldCheck,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
      description: "Teslimatı ve montajı eksiksiz tamamlanmış, tüm tahsilatları alınarak kapatılmış sipariştir.",
    },
    {
      name: "İptal Edildi",
      icon: XCircle,
      color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
      description: "Müşteri veya firma tarafından iptal edilen, operasyonu durdurulmuş sipariştir.",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Sistem ve Süreç Ayarları
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Sipariş iş akış durumları, WhatsApp & SMS bildirim şablonları ve firma tanımları.
        </p>
      </div>

      {/* Section 1: Order Status Workflow */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Sipariş Durumları & Operasyonel İş Akışı
              </h3>
              <p className="text-[11px] text-slate-400">
                Siparişlerin adım adım ilerlediği tanımlı süreçler ve anlamları
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {statusDefinitions.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${item.color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: WhatsApp Messages & Templates */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              WhatsApp Hızlı Bildirim Şablonları
            </h3>
            <p className="text-[11px] text-slate-400">
              Tek tıkla müşteriye gönderilen otomatik mesaj taslakları (Telefon numarası ve linkler otomatik eklenir)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Template 1: Quotation Approval */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>1. Teklif Onay Linki Mesajı</span>
                <span className="text-[10px] text-blue-600 font-semibold">Teklifler Bölümü</span>
              </div>
              <div className="mt-2 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
{`Sayın {Müşteri Adı},
{Teklif No} numaralı teklifiniz hazırlanmıştır.
Teklifi incelemek ve onaylamak için:
🔗 {Onay Linki}
Sorularınız için bize yazabilirsiniz.`}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                copyTemplate(
                  "quote",
                  "Sayın {Müşteri Adı},\n{Teklif No} numaralı teklifiniz hazırlanmıştır.\nTeklifi incelemek ve onaylamak için:\n🔗 {Onay Linki}\nSorularınız için bize yazabilirsiniz."
                )
              }
              className="mt-2 w-full py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
            >
              {copiedKey === "quote" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "quote" ? "Kopyalandı" : "Metni Kopyala"}</span>
            </button>
          </div>

          {/* Template 2: Payment Reminder */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>2. Kalan Ödeme Hatırlatması</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Siparişler Bölümü</span>
              </div>
              <div className="mt-2 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
{`Sayın {Müşteri Adı},
{Sipariş No} numaralı siparişinize ait bakiye durumu:
💰 Toplam Tutar: {Toplam} ₺
✅ Yapılan Ödeme: {Ödenen} ₺
⏳ Kalan Bakiye: {Kalan} ₺
Dekontunuzu iletebilirsiniz.`}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                copyTemplate(
                  "payment",
                  "Sayın {Müşteri Adı},\n{Sipariş No} numaralı siparişinize ait bakiye durumu:\n💰 Toplam Tutar: {Toplam} ₺\n✅ Yapılan Ödeme: {Ödenen} ₺\n⏳ Kalan Bakiye: {Kalan} ₺\nDekontunuzu iletebilirsiniz."
                )
              }
              className="mt-2 w-full py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
            >
              {copiedKey === "payment" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "payment" ? "Kopyalandı" : "Metni Kopyala"}</span>
            </button>
          </div>

          {/* Template 3: Order Status Tracker */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>3. Sipariş Durumu & Canlı Takip</span>
                <span className="text-[10px] text-indigo-600 font-semibold">Sipariş Takip Linki</span>
              </div>
              <div className="mt-2 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
{`Sayın {Müşteri Adı},
{Sipariş No} numaralı siparişinizin durumu "{Durum}" olarak güncellenmiştir.
Siparişinizi anlık takip etmek için:
🔗 {Takip Linki}
İyi günler dileriz.`}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                copyTemplate(
                  "status",
                  "Sayın {Müşteri Adı},\n{Sipariş No} numaralı siparişinizin durumu \"{Durum}\" olarak güncellenmiştir.\nSiparişinizi anlık takip etmek için:\n🔗 {Takip Linki}\nİyi günler dileriz."
                )
              }
              className="mt-2 w-full py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
            >
              {copiedKey === "status" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "status" ? "Kopyalandı" : "Metni Kopyala"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Future SMS Gateway Settings */}
      <form
        onSubmit={handleSaveSms}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                SMS Servisi Entegrasyonu (Gelecek Özellik)
              </h3>
              <p className="text-[11px] text-slate-400">
                Şu anda WhatsApp doğrudan kullanılmaktadır. İleride bağlanacak SMS altyapısı için sağlayıcı bilgilerinizi tanımlayabilirsiniz.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
            Hazır Altyapı
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              SMS Sağlayıcısı
            </label>
            <select
              value={smsProvider}
              onChange={(e) => setSmsProvider(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="netgsm">Netgsm SMS</option>
              <option value="iletimerkezi">İletiMerkezi</option>
              <option value="mutlucell">Mutlucell</option>
              <option value="twilio">Twilio Global</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Gönderici Başlığı (Alfanumerik)
            </label>
            <input
              type="text"
              value={smsHeader}
              onChange={(e) => setSmsHeader(e.target.value)}
              placeholder="Örn: MOBILYA"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              API Anahtarı / Şifresi
            </label>
            <input
              type="password"
              value={smsApiKey}
              onChange={(e) => setSmsApiKey(e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            SMS Ayarlarını Kaydet
          </button>
        </div>
      </form>

      {/* Section 4: Company Profile */}
      <form
        onSubmit={handleSaveCompany}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Firma & Belge Bilgileri
            </h3>
            <p className="text-[11px] text-slate-400">
              PDF belgelerinde, teklif çıktılarında ve bildirimlerde görünecek kurumsal bilgiler
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Firma Ünvanı
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Firma Telefonu (WhatsApp Hattı)
            </label>
            <input
              type="text"
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              E-posta Adresi
            </label>
            <input
              type="email"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Firma Adresi
            </label>
            <input
              type="text"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            Firma Bilgilerini Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
