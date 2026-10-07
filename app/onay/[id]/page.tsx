"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { quotationService } from "@/lib/api";
import { QuotationDetail, QuotationStatus } from "@/types";
import { StatusBadge } from "@/components/UI/StatusBadge";
import {
  ExternalLink,
  FileText,
  Loader2,
  X,
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
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex flex-col items-center justify-center p-4 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Teklif belgesi yükleniyor...
        </p>
      </div>
    );
  }

  if (errorMsg || !detail) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-white dark:bg-[#111827] rounded-lg p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
            <X className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Teklif Belgesine Ulaşılamadı
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {errorMsg || "Ulaşmaya çalıştığınız teklif bağlantısı geçersiz, süresi dolmuş veya kaldırılmış olabilir."}
          </p>
        </div>
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

  const isAssembly = detail.isAssemblyIncluded !== false;
  const isDelivery = detail.isDeliveryIncluded !== false;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Top Header Bar */}
        <div className="bg-white dark:bg-[#111827] rounded-lg border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center font-bold text-xs tracking-wider shrink-0">
              ST
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                Satış Takip Portalı
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Resmi Müşteri Teklif Onay Ekranı
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <StatusBadge type="quotation" status={detail.status} size="sm" />
            {detail.quotationPdfUrl && (
              <a
                href={detail.quotationPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>PDF İndir</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
          </div>
        </div>

        {/* Accepted Confirmation Banner */}
        {isAccepted && (
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-xs text-emerald-900 dark:text-emerald-200">
                Teklif Tarafınızca Onaylandı
              </h3>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 mt-0.5 leading-relaxed">
                Bu teklif kabul edilerek kesin sipariş sürecine alınmıştır. Operasyonel hazırlıklar başlatılmıştır.
              </p>
            </div>
          </div>
        )}

        {/* Main Quotation Sheet */}
        <div className="bg-white dark:bg-[#111827] rounded-lg border border-slate-200 dark:border-slate-800 p-4 sm:p-7 space-y-6 shadow-xs">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Satış Teklifi
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {detail.quotationNumber}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Tarih: {new Date(detail.quotationDate).toLocaleDateString("tr-TR")}</span>
                {detail.validUntil && (
                  <span className="text-amber-700 dark:text-amber-400 font-medium">
                    Son Geçerlilik: {new Date(detail.validUntil).toLocaleDateString("tr-TR")}
                  </span>
                )}
              </div>
            </div>

            {/* Customer Information Card */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs w-full sm:w-72">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Müşteri Bilgileri
              </div>
              <div className="font-semibold text-slate-900 dark:text-white">
                {detail.customer?.companyName || detail.customerName}
              </div>
              {detail.customer?.companyName && (
                <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                  Yetkili: {detail.customer.firstName} {detail.customer.lastName}
                </div>
              )}
              {detail.customer?.phone && (
                <div className="text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  {detail.customer.phone}
                </div>
              )}
              {detail.customer?.email && (
                <div className="text-slate-500 mt-0.5 truncate">
                  {detail.customer.email}
                </div>
              )}
              {detail.customer?.address && (
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {detail.customer.address}
                </div>
              )}
            </div>
          </div>

          {/* Quotation Conditions (Clean Corporate Cards) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Teklif Koşulları
              </h3>
              <span className="text-[11px] text-slate-400">
                Geçerli operasyonel parametreler
              </span>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAssembly ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-3`}>
              {/* Montaj Koşulu */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {isAssembly ? "Montaj & Teslimat" : "Montaj Hizmeti"}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                    isAssembly
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}>
                    {isAssembly ? "Dahil" : "Hariç"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {isAssembly
                    ? "Montaj ve adrese teslimat fiyata dahildir."
                    : "Montaj hariçtir, teslimat demonte olarak yapılır."}
                </p>
              </div>

              {/* Teslimat Koşulu (Eğer montaj hariç ise) */}
              {!isAssembly && (
                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Teslimat Hizmeti
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      isDelivery
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      {isDelivery ? "Dahil" : "Hariç"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {isDelivery
                      ? "Teslim adresine nakliye tarafımıza aittir."
                      : "Nakliye sorumluluğu alıcıdadır. Mağazadan teslim edilecektir."}
                  </p>
                </div>
              )}

              {/* Teslim Tarihi */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Teslimat Tarihi
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {detail.deliveryDays ? `${detail.deliveryDays} İş Günü` : "Planlanacak"}
                  </span>
                </div>
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                  {detail.expectedDeliveryDate
                    ? new Date(detail.expectedDeliveryDate).toLocaleDateString("tr-TR")
                    : detail.deliveryDays
                    ? `${detail.deliveryDays} iş günü içinde`
                    : "Sipariş sonrasında belirlenir"}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                  Ödeme sonrası teslimat süreci başlar. (Mücbir sebepler ve operasyonel
aksaklıklar sebebiyle doğabilecek istisnai gecikmeler saklıdır.)
                </p>
              </div>

              {/* KDV Durumu */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    KDV Durumu
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                    detail.isVatIncluded !== false
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                  }`}>
                    {detail.isVatIncluded !== false ? "KDV Dahil" : "KDV Hariç"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {detail.isVatIncluded !== false
                    ? "Toplam fiyata tüm vergiler dahildir."
                    : "Belirtilen tutara KDV dahil değildir."}
                </p>
              </div>
            </div>
          </div>

          {/* Notes if present */}
          {detail.notes && (
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Teklif Notu & Şartlar:
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {detail.notes}
              </p>
            </div>
          )}

          {/* Quotation Items: Dual Desktop Table + Mobile Card View */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Ürün & Hizmet Kalemleri
              </h3>
              <span className="text-[11px] text-slate-400">
                {detail.items.length} Kalem
              </span>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3.5 w-10 text-center font-semibold">#</th>
                    <th className="py-2.5 px-3.5 font-semibold">Ürün / Hizmet Açıklaması</th>
                    <th className="py-2.5 px-3.5 text-center w-24 font-semibold">Miktar</th>
                    <th className="py-2.5 px-3.5 text-right w-32 font-semibold">Birim Fiyat</th>
                    <th className="py-2.5 px-3.5 text-right w-36 font-semibold">Toplam Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {detail.items.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3.5 text-center text-slate-400 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {item.productName}
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-center font-medium text-slate-800 dark:text-slate-200">
                        {item.quantity} Adet
                      </td>
                      <td className="py-2.5 px-3.5 text-right text-slate-700 dark:text-slate-300">
                        {item.unitPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-semibold text-slate-900 dark:text-white">
                        {item.totalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              {detail.items.map((item, index) => (
                <div key={item.id || index} className="p-3 bg-white dark:bg-[#111827] space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">
                      <span className="text-slate-400 mr-1.5">#{index + 1}</span>
                      {item.productName}
                    </div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white shrink-0">
                      {item.totalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                    </span>
                  </div>

                  {item.description && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {item.description}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <span>Miktar: {item.quantity} Adet</span>
                    <span>Birim: {item.unitPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grand Total Summary Box */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                detail.isVatIncluded !== false
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
              }`}>
                {detail.isVatIncluded !== false ? "KDV Dahildir" : "KDV Hariçtir"}
              </span>
              {detail.expectedDeliveryDate && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Teslim: {new Date(detail.expectedDeliveryDate).toLocaleDateString("tr-TR")}
                </span>
              )}
            </div>

            <div className="flex items-baseline justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Teklif Toplamı:
              </span>
              <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {detail.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
              </span>
            </div>
          </div>

          {/* Rejection Prompt Box */}
          {showRejectBox && (
            <div className="p-4 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-3">
              <div className="font-semibold text-xs text-rose-800 dark:text-rose-300">
                Teklifi Reddetme Gerekçesi (Opsiyonel)
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Fiyat, koşullar veya revize talebiniz varsa belirtebilirsiniz..."
                rows={2}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectBox(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 dark:text-slate-400 font-medium"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors"
                >
                  {submitting ? "İşleniyor..." : "Reddetmeyi Onayla"}
                </button>
              </div>
            </div>
          )}

          {/* Customer Approval Actions */}
          {isPending && !actionDone && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowRejectBox(true)}
                disabled={submitting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors text-center"
              >
                Teklifi Kabul Etmiyorum
              </button>

              <button
                type="button"
                onClick={handleAccept}
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Teklifi Onayla ve Kabul Et</span>
              </button>
            </div>
          )}
        </div>

        {/* Security / System Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 px-1 gap-1">
          <span>Bu bağlantı ilgili müşteri ve teklif için özel olarak üretilmiştir.</span>
          <span>Güvenli İletişim</span>
        </div>
      </div>
    </div>
  );
}
