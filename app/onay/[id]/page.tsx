"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { quotationService } from "@/lib/api";
import { QuotationDetail, QuotationStatus } from "@/types";
import { StatusBadge } from "@/components/UI/StatusBadge";
import {
  ShieldCheck,
  Calendar,
  Clock,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  Wrench,
  Loader2,
  Check,
  Receipt,
  FileCheck,
  PackageCheck,
  Info,
  Sparkles,
} from "lucide-react";

export default function CustomerApprovalPage() {
  const params = useParams();
  const quotationId = params?.id as string;

  const [detail, setDetail] = useState<QuotationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Actions
  const [submitting, setSubmitting] = useState(false);
  const [actionDone, setActionDone] = useState<"accepted" | "rejected" | null>(null);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const loadData = async () => {
    if (!quotationId) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await quotationService.getById(quotationId);
      setDetail(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Teklif bulunamadı veya bağlantı geçersiz.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [quotationId]);

  const handleAccept = async () => {
    if (!quotationId) return;
    try {
      setSubmitting(true);
      await quotationService.accept(quotationId);
      setActionDone("accepted");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Teklif onaylanırken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!quotationId) return;
    try {
      setSubmitting(true);
      await quotationService.reject(quotationId, rejectReason.trim() || undefined);
      setActionDone("rejected");
      setShowRejectBox(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col items-center justify-center p-6 text-slate-500">
        <Loader2 className="w-9 h-9 animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Teklif belgesi yükleniyor...
        </p>
        <span className="text-xs text-slate-400 mt-1">Lütfen bekleyin</span>
      </div>
    );
  }

  if (errorMsg || !detail) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mb-3 shadow-inner">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Teklif Belgesine Ulaşılamadı
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
          {errorMsg || "Ulaşmaya çalıştığınız teklif bağlantısı geçersiz, süresi dolmuş veya sistemden kaldırılmış olabilir."}
        </p>
      </div>
    );
  }

  const isPending =
    detail.status === QuotationStatus.WaitingForApproval ||
    detail.status === QuotationStatus.Draft;

  const isAccepted =
    detail.status === QuotationStatus.Accepted ||
    detail.status === QuotationStatus.Approved ||
    actionDone === "accepted";

  // Delivery conditions calculations
  const isAssembly = detail.isAssemblyIncluded !== false;
  const isDelivery = detail.isDeliveryIncluded !== false;

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-[#090d16] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Brand & Portal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/90 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Satış Takip Portalı</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  Resmi Onay Sayfası
                </span>
              </div>
              <div className="text-xs text-slate-500">Müşteri Teklif Değerlendirme & Kabul Sistemi</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge type="quotation" status={detail.status} size="md" />
            {detail.quotationPdfUrl && (
              <a
                href={detail.quotationPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Teklif PDF</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
          </div>
        </div>

        {/* Accepted Confirmation Banner */}
        {isAccepted && (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3.5 animate-in fade-in shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-300">
                Teklif Tarafınızca Onaylandı
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-400/90 mt-0.5 leading-relaxed">
                Bu teklif kabul edilerek kesin sipariş sürecine alınmıştır. İlgili operasyon ve teslimat planlaması başlatılmıştır.
              </p>
            </div>
          </div>
        )}

        {/* Main Quotation Sheet */}
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm overflow-hidden p-6 sm:p-9 space-y-7">
          {/* Top Sheet Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Satış Teklifi</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {detail.quotationNumber}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Teklif Tarihi: {new Date(detail.quotationDate).toLocaleDateString("tr-TR")}</span>
                </div>
                {detail.validUntil && (
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Geçerlilik: {new Date(detail.validUntil).toLocaleDateString("tr-TR")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information Box */}
            <div className="bg-slate-50/80 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 text-xs min-w-[280px]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3 h-3" /> Müşteri Bilgileri
              </div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {detail.customer?.companyName || detail.customerName}
              </div>
              {detail.customer?.companyName && (
                <div className="text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                  Yetkili: {detail.customer.firstName} {detail.customer.lastName}
                </div>
              )}
              {detail.customer?.phone && (
                <div className="flex items-center gap-1.5 text-slate-500 mt-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{detail.customer.phone}</span>
                </div>
              )}
              {detail.customer?.email && (
                <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{detail.customer.email}</span>
                </div>
              )}
              {detail.customer?.address && (
                <div className="flex items-start gap-1.5 text-slate-500 mt-1.5 text-[11px] leading-snug">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{detail.customer.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* TEKLİF KOŞULLARI & TAAHHÜTLER (Teklif Koşulları Kartları) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Teklif Koşulları & Taahhütler</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                Bu teklifte geçerli operasyonel koşullar
              </span>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAssembly ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-3.5`}>
              {/* 1. Montaj (ve Teslimat) Koşulu */}
              {isAssembly ? (
                /* Montaj Dahil Durumunda: Montaj ve Teslimat tek kart olarak belirtilir */
                <div className="p-4 rounded-2xl border transition-all bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-purple-600 text-white shadow-sm">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                      Dahil
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    Montaj ve Teslimat Dahildir
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    Uzman teknik ekibimiz tarafından sahada montaj, kurulum ve adrese teslimat fiyata dahildir.
                  </p>
                </div>
              ) : (
                /* Montaj Hariç Durumunda */
                <div className="p-4 rounded-2xl border transition-all bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-500">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                      Hariç
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    Montaj Hariçtir
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    Montaj hizmeti tercih edilmediği takdirde, ürünün teslimatı kurulmadan demonte olarak gerçekleştirilecektir.
                  </p>
                </div>
              )}

              {/* 2. Teslimat Koşulu - Sadece Montaj hariç ise ayrı kart olarak gösterilir */}
              {!isAssembly && (
                <div className={`p-4 rounded-2xl border transition-all ${
                  isDelivery
                    ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60"
                    : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isDelivery
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                    }`}>
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isDelivery
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      {isDelivery ? "Dahil" : "Hariç"}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    {detail.deliveryStatusText || (isDelivery ? "Teslimat Dahildir" : "Teslimat Hariçtir")}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {isDelivery
                      ? "Belirtilen teslim adresine nakliye ve lojistik masrafları tarafımıza aittir."
                      : "Lojistik ve nakliye alıcı firma/müşteri tarafından karşılanacaktır."}
                  </p>
                </div>
              )}

              {/* 3. Teslim Tarihi */}
              <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                    Teslim Tarihi
                  </span>
                </div>
                <div className="font-bold text-xs text-indigo-950 dark:text-indigo-200">
                  Teslim Tarihi
                </div>
                <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {detail.expectedDeliveryDate
                    ? new Date(detail.expectedDeliveryDate).toLocaleDateString("tr-TR")
                    : detail.deliveryDays
                    ? `${detail.deliveryDays} İş Günü`
                    : "Sipariş Akabinde Planlanır"}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                  {detail.deliveryDays
                    ? `Onay tarihinden itibaren en geç ${detail.deliveryDays} gün içinde teslim edilir. Mücbir sebepler ve operasyonel aksaklıklar sebebiyle doğabilecek istisnai gecikmeler saklıdır.`
                    : "Ürün ve tedarik durumuna göre en hızlı sürede teslimat yapılır."}
                </p>
              </div>

              {/* 4. KDV Uygulaması */}
              <div className={`p-4 rounded-2xl border ${
                detail.isVatIncluded !== false
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60"
                  : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    detail.isVatIncluded !== false
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-amber-600 text-white shadow-sm"
                  }`}>
                    <Receipt className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    detail.isVatIncluded !== false
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                  }`}>
                    {detail.isVatIncluded !== false ? "KDV Dahil" : "KDV Hariç"}
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  KDV Uygulaması
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  {detail.isVatIncluded !== false ? (detail.vatStatusText || "Fiyatlara KDV Dahildir") : "KDV Hariçtir."}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                  {detail.isVatIncluded !== false
                    ? "KDV toplam fiyata dahildir."
                    : "Anlaşılan Tutara KDV dahil değildir."}
                </p>
              </div>
            </div>

            {/* Montaj Hariç Durumu Bilgilendirme Kutusu */}
            {!isAssembly && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Montaj hizmeti tercih edilmediği takdirde, ürünün teslimatı kurulmadan demonte olarak gerçekleştirilecektir.
                </span>
              </div>
            )}
          </div>

          {/* Notes if present */}
          {detail.notes && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                Özel Teklif Açıklaması ve Şartlar:
              </div>
              <p className="text-slate-600 dark:text-slate-400 pl-5 leading-relaxed">
                {detail.notes}
              </p>
            </div>
          )}

          {/* Items Table (Clean, Professional, No Operational Badges Column) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Teklif Kapsamındaki Ürün & Hizmet Kalemleri
              </h3>
              <span className="text-[11px] text-slate-400">
                Toplam {detail.items.length} Kalem
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5 w-12 text-center text-slate-400 font-bold">#</th>
                    <th className="p-3.5">Ürün / Hizmet Açıklaması</th>
                    <th className="p-3.5 text-center w-24">Miktar</th>
                    <th className="p-3.5 text-right w-32">Birim Fiyat</th>
                    <th className="p-3.5 text-right w-36">Toplam Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {detail.items.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 text-center text-slate-400 font-medium">
                        {index + 1}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          {item.productName}
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-800 dark:text-slate-200">
                        {item.quantity} Adet
                      </td>
                      <td className="p-3.5 text-right font-medium text-slate-700 dark:text-slate-300">
                        {item.unitPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">
                        {item.totalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grand Total Summary Box */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 dark:from-slate-800/60 dark:to-blue-950/20 border border-slate-200/90 dark:border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                detail.isVatIncluded !== false
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800"
              }`}>
                {detail.isVatIncluded !== false ? (detail.vatStatusText || "✓ Fiyatlara KDV Dahildir") : "⚠️ KDV Hariçtir."}
              </span>
              {detail.expectedDeliveryDate && (
                <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium hidden sm:inline-block">
                  Teslim Tarihi: {new Date(detail.expectedDeliveryDate).toLocaleDateString("tr-TR")}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3 text-right">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Teklif Toplamı:
              </span>
              <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                {detail.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
              </span>
            </div>
          </div>

          {/* Rejection Prompt Box */}
          {showRejectBox && (
            <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30 space-y-3 animate-in fade-in">
              <div className="font-bold text-xs text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                Teklifi Reddetme Nedeni (Opsiyonel)
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Lütfen teklif koşulları veya fiyatla ilgili geri bildiriminizi yazınız..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRejectBox(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Reddetmeyi Onayla</span>
                </button>
              </div>
            </div>
          )}

          {/* Customer Approval CTA Actions */}
          {isPending && !actionDone && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setShowRejectBox(true)}
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl border border-rose-300 dark:border-rose-800/80 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Teklifi Kabul Etmiyorum</span>
              </button>

              <button
                type="button"
                onClick={handleAccept}
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-black shadow-lg shadow-emerald-600/25 transition-all"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                <span>Teklifi Onayla ve Kabul Et</span>
              </button>
            </div>
          )}
        </div>

        {/* Legal & Security Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 px-2 gap-2">
          <span>Bu onay bağlantısı sadece ilgili müşteri ve teklif için özel olarak üretilmiştir.</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            256-bit Güvenli İletişim
          </span>
        </div>
      </div>
    </div>
  );
}
