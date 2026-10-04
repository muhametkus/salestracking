"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { quotationService } from "@/lib/api";
import { QuotationDetail, QuotationStatus } from "@/types";
import { StatusBadge, getQuotationStatusTitle } from "@/components/UI/StatusBadge";
import {
  ShieldCheck,
  Calendar,
  User,
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Hammer,
  Truck,
  Wrench,
  Loader2,
  AlertCircle,
  Building,
  MapPin,
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-medium">Teklif belgesi yükleniyor...</p>
      </div>
    );
  }

  if (errorMsg || !detail) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Teklif Bulunamadı
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          {errorMsg || "Ulaşmaya çalıştığınız teklif bağlantısı geçersiz veya yayından kaldırılmış olabilir."}
        </p>
      </div>
    );
  }

  const isPending =
    detail.status === QuotationStatus.WaitingForApproval ||
    detail.status === QuotationStatus.Draft;

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-[#090d16] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Portal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                Satış Takip Sistemi
              </div>
              <div className="text-[11px] text-slate-500">Müşteri Teklif Onay Portalı</div>
            </div>
          </div>

          <StatusBadge type="quotation" status={detail.status} size="md" />
        </div>

        {/* Success Confirmation Banner if already approved */}
        {detail.status === QuotationStatus.Accepted ||
        detail.status === QuotationStatus.Approved ||
        actionDone === "accepted" ? (
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 animate-in fade-in">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-300">
                Teklif Onaylandı!
              </h3>
              <p className="text-xs text-emerald-800/90 dark:text-emerald-400/90 mt-0.5">
                Bu teklifi başarıyla kabul ettiniz. Sipariş ve üretim süreçleri operasyon ekibimiz tarafından başlatılmaktadır.
              </p>
            </div>
          </div>
        ) : null}

        {/* Main Document Card */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
          {/* Document Header info */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                Satış Teklifi
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {detail.quotationNumber}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tarih: {new Date(detail.quotationDate).toLocaleDateString("tr-TR")}</span>
                </div>
                {detail.validUntil && (
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Geçerlilik: {new Date(detail.validUntil).toLocaleDateString("tr-TR")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Box */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs sm:text-right">
              <div className="text-[10px] font-semibold text-slate-400 uppercase">
                Sayın Müşterimiz
              </div>
              <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                {detail.customerName}
              </div>
            </div>
          </div>

          {/* Notes if any */}
          {detail.notes && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Teklif Şartları & Notlar:
              </span>{" "}
              <span className="text-slate-600 dark:text-slate-400">{detail.notes}</span>
            </div>
          )}

          {/* Items Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Teklif Kapsamındaki Ürün ve Hizmetler
            </h3>
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Ürün / Açıklama</th>
                    <th className="p-3.5">Operasyonel Rozetler</th>
                    <th className="p-3.5 text-right">Adet</th>
                    <th className="p-3.5 text-right">Birim Fiyat</th>
                    <th className="p-3.5 text-right">Toplam Fiyat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {detail.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.productName}
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.requiresProduction && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] font-medium border border-amber-200 dark:border-amber-800">
                              <Hammer className="w-2.5 h-2.5" /> Üretim Gerektirir
                            </span>
                          )}
                          {item.requiresDelivery && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 text-[10px] font-medium border border-blue-200 dark:border-blue-800">
                              <Truck className="w-2.5 h-2.5" /> Teslimat Dahil
                            </span>
                          )}
                          {item.requiresInstallation && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 text-[10px] font-medium border border-purple-200 dark:border-purple-800">
                              <Wrench className="w-2.5 h-2.5" /> Montaj Dahil
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-medium text-slate-700 dark:text-slate-300">
                        {item.quantity}
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

          {/* Total Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 gap-3">
            <div className="flex items-center gap-2">
              {detail.quotationPdfUrl && (
                <a
                  href={detail.quotationPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:text-blue-600 transition-colors shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Resmi Teklif PDF İndir</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                detail.isVatIncluded !== false
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800"
              }`}>
                {detail.vatStatusText || (detail.isVatIncluded !== false ? "✓ Fiyata KDV dahildir" : "⚠️ KDV Hariç (+%20 KDV)")}
              </span>
            </div>

            <div className="text-right flex items-baseline gap-2">
              <span className="text-xs text-slate-500 font-medium">Genel Toplam Tutar:</span>
              <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
                {detail.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
              </span>
            </div>
          </div>

          {/* Rejection box if open */}
          {showRejectBox && (
            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300">
                Teklifi Reddetme Nedeni (Opsiyonel)
              </h4>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Fiyat yüksek, vade uygun değil veya proje ertelendi..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectBox(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                >
                  Reddetmeyi Onayla
                </button>
              </div>
            </div>
          )}

          {/* Action Approval Area for Customer */}
          {isPending && !actionDone && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setShowRejectBox(true)}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Teklifi Kabul Etmiyorum
              </button>

              <button
                type="button"
                onClick={handleAccept}
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                <span>Teklifi Onayla ve Kabul Et</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-400">
          Bu bağlantı sadece ilgili teklifin incelenmesi ve onaylanması amacıyla üretilmiştir.
        </div>
      </div>
    </div>
  );
}
