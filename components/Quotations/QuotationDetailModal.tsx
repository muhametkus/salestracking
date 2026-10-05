"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/UI/Modal";
import { customerService, quotationService } from "@/lib/api";
import { QuotationDetail, QuotationStatus } from "@/types";
import { StatusBadge, getQuotationStatusTitle } from "@/components/UI/StatusBadge";
import { useNotification } from "@/components/UI/NotificationContext";
import {
  createQuotationApprovalWhatsAppUrl,
  openWhatsApp,
} from "@/lib/whatsapp";
import {
  Loader2,
  Calendar,
  User,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Ban,
  PackageCheck,
  ExternalLink,
  History,
  Hammer,
  Truck,
  Wrench,
  Link as LinkIcon,
  Check,
  Share2,
  Copy,
  AlertTriangle,
  FileCode,
  MessageCircle,
  Clock,
  MapPin,
  Building,
  Phone,
  Mail,
} from "lucide-react";

interface QuotationDetailModalProps {
  quotationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const QuotationDetailModal: React.FC<QuotationDetailModalProps> = ({
  quotationId,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const { success, error, info } = useNotification();
  const [detail, setDetail] = useState<QuotationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // PDF URL editing / Generating
  const [isEditingPdf, setIsEditingPdf] = useState(false);
  const [pdfUrlInput, setPdfUrlInput] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Customer Approval Link Share Modal state
  const [shareLinkModal, setShareLinkModal] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Direct approve without customer confirmation modal state
  const [confirmDirectApprove, setConfirmDirectApprove] = useState(false);

  // Reject / Cancel Reason modal prompt
  const [reasonPrompt, setReasonPrompt] = useState<{
    type: "reject" | "cancel" | null;
    reason: string;
  }>({ type: null, reason: "" });

  useEffect(() => {
    if (isOpen && quotationId) {
      loadDetail(quotationId);
    } else {
      setDetail(null);
      setIsEditingPdf(false);
      setShareLinkModal(null);
      setConfirmDirectApprove(false);
      setReasonPrompt({ type: null, reason: "" });
    }
  }, [isOpen, quotationId]);

  const loadDetail = async (id: string) => {
    try {
      setLoading(true);
      const data = await quotationService.getById(id);
      setDetail(data);
      setPdfUrlInput(data.quotationPdfUrl || "");
    } catch (err: any) {
      error(err.message || "Teklif detayı alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const getApprovalUrl = (id: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/onay/${id}`;
    }
    return `http://localhost:3000/onay/${id}`;
  };

  // Generate PDF automatically via microservice
  const handleGeneratePdf = async () => {
    if (!detail) return;
    try {
      setGeneratingPdf(true);
      const url = await quotationService.generatePdf(detail);
      if (url) {
        success("PDF belgesi başarıyla oluşturuldu ve teklife bağlandı!");
        setPdfUrlInput(url);
        await loadDetail(detail.id);
        onRefresh();
      } else {
        info("PDF servisi çağrıldı, bağlantı güncellendi.");
      }
    } catch (err: any) {
      error(err.message || "PDF oluşturulamadı. Lütfen servis bağlantısını kontrol edin.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleOpenWhatsApp = async () => {
    if (!detail) return;
    let phone = detail.customerPhone;
    if (!phone && detail.customerId) {
      try {
        const cust = await customerService.getById(detail.customerId);
        phone = cust.phone;
      } catch {}
    }

    const wpUrl = createQuotationApprovalWhatsAppUrl({
      phone,
      customerName: detail.customerName,
      quotationNumber: detail.quotationNumber,
      quotationId: detail.id,
      totalAmount: detail.totalAmount,
    });

    openWhatsApp(wpUrl);
    info("WhatsApp mesajı hazırlandı ve açılıyor...");
  };

  const handleSendForApproval = async () => {
    if (!quotationId || !detail) return;
    try {
      setActionLoading("send-for-approval");
      await quotationService.sendForApproval(quotationId);
      success("Teklif müşteri onayına gönderildi.");
      
      // WhatsApp mesajını hazırla ve aç
      await handleOpenWhatsApp();

      await loadDetail(quotationId);
      onRefresh();
    } catch (err: any) {
      error(err.message || "İşlem gerçekleştirilemedi.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDirectApproveClick = () => {
    if (!detail) return;
    // Check if customer approved already (status === Accepted)
    if (detail.status === QuotationStatus.Accepted) {
      // Proceed directly
      executeApprove();
    } else {
      // Prompt warning confirmation
      setConfirmDirectApprove(true);
    }
  };

  const executeApprove = async () => {
    if (!quotationId) return;
    try {
      setActionLoading("approve");
      // If not yet accepted, first accept it, then approve
      if (detail && detail.status !== QuotationStatus.Accepted) {
        await quotationService.accept(quotationId);
      }
      const res = await quotationService.approve(quotationId);
      success(`Teklif başarıyla onaylandı ve #${res.orderId.substring(0, 8)} numaralı sipariş oluşturuldu!`);
      setConfirmDirectApprove(false);
      await loadDetail(quotationId);
      onRefresh();
    } catch (err: any) {
      error(err.message || "Sipariş oluşturulamadı.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReasonSubmit = async () => {
    if (!quotationId || !reasonPrompt.type) return;
    try {
      setActionLoading(reasonPrompt.type);
      if (reasonPrompt.type === "reject") {
        await quotationService.reject(quotationId, reasonPrompt.reason);
        success("Teklif reddedildi olarak işaretlendi.");
      } else if (reasonPrompt.type === "cancel") {
        await quotationService.cancel(quotationId, reasonPrompt.reason);
        success("Teklif iptal edildi.");
      }
      setReasonPrompt({ type: null, reason: "" });
      await loadDetail(quotationId);
      onRefresh();
    } catch (err: any) {
      error(err.message || "İşlem gerçekleştirilemedi.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSavePdfUrl = async () => {
    if (!quotationId) return;
    try {
      setActionLoading("pdf");
      await quotationService.updatePdfUrl(quotationId, pdfUrlInput.trim());
      success("PDF URL başarıyla güncellendi.");
      setIsEditingPdf(false);
      await loadDetail(quotationId);
      onRefresh();
    } catch (err: any) {
      error(err.message || "PDF URL kaydedilemedi.");
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    success("Müşteri onay linki panoya kopyalandı!");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <>
      <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={detail ? `Teklif: ${detail.quotationNumber}` : "Teklif Detayı"}
      subtitle={detail ? `Müşteri: ${detail.customerName}` : ""}
      maxWidth="4xl"
    >
      {loading || !detail ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span>Teklif detayları yükleniyor...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Info Banner */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <StatusBadge
                type="quotation"
                status={detail.status}
                size="md"
              />
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                detail.isVatIncluded !== false
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800"
              }`}>
                {detail.vatStatusText || (detail.isVatIncluded !== false ? "✓ Fiyata KDV dahildir" : "⚠️ KDV Hariç (+%20 KDV)")}
              </span>
              {detail.isConvertedToOrder && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Siparişe Dönüştürüldü
                </span>
              )}
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Tarih: {new Date(detail.quotationDate).toLocaleDateString("tr-TR")}
                </span>
              </div>
              {detail.validUntil && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    Son Geçerlilik:{" "}
                    {new Date(detail.validUntil).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              )}
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Toplam:{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  {detail.totalAmount.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  ₺
                </span>
              </div>
            </div>
          </div>

          {/* Customer Details & Quotation Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Information Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Müşteri Bilgileri
              </div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {detail.customer?.companyName || detail.customerName}
              </div>
              {detail.customer?.companyName && (
                <div className="text-slate-600 dark:text-slate-400">
                  Yetkili: {detail.customer.firstName} {detail.customer.lastName}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-slate-500">
                {(detail.customer?.phone || detail.customerPhone) && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{detail.customer?.phone || detail.customerPhone}</span>
                  </div>
                )}
                {(detail.customer?.email || detail.customerEmail) && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{detail.customer?.email || detail.customerEmail}</span>
                  </div>
                )}
              </div>
              {detail.customer?.address && (
                <div className="flex items-start gap-1.5 text-slate-500 pt-1 text-[11px] leading-snug">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{detail.customer.address}</span>
                </div>
              )}
            </div>

            {/* Conditions & Delivery Timeframe Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 text-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-600" /> Teklif Koşulları & Teslimat
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className={`p-2.5 rounded-lg border ${
                  detail.isAssemblyIncluded !== false
                    ? "bg-purple-50/60 text-purple-900 dark:bg-purple-950/30 dark:text-purple-300 border-purple-200 dark:border-purple-900/60"
                    : "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }`}>
                  <div className="flex items-center gap-1.5 font-bold text-[11px]">
                    <Wrench className="w-3.5 h-3.5 text-purple-600" /> Montaj
                  </div>
                  <div className="font-semibold text-xs mt-1">
                    {detail.assemblyStatusText || (detail.isAssemblyIncluded !== false ? "Montaj Dahildir" : "Montaj Hariçtir")}
                  </div>
                </div>

                <div className={`p-2.5 rounded-lg border ${
                  detail.isDeliveryIncluded !== false
                    ? "bg-blue-50/60 text-blue-900 dark:bg-blue-950/30 dark:text-blue-300 border-blue-200 dark:border-blue-900/60"
                    : "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }`}>
                  <div className="flex items-center gap-1.5 font-bold text-[11px]">
                    <Truck className="w-3.5 h-3.5 text-blue-600" /> Teslimat
                  </div>
                  <div className="font-semibold text-xs mt-1">
                    {detail.deliveryStatusText || (detail.isDeliveryIncluded !== false ? "Teslimat Dahildir" : "Teslimat Hariçtir")}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-950 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Maksimum Teslim Tarihi:
                  </span>
                </div>
                <div className="font-bold text-indigo-600 dark:text-indigo-400">
                  {detail.expectedDeliveryDate
                    ? new Date(detail.expectedDeliveryDate).toLocaleDateString("tr-TR")
                    : detail.deliveryDays
                    ? `${detail.deliveryDays} Gün`
                    : "Belirtilmedi"}
                </div>
              </div>
            </div>
          </div>

          {/* Share Link Modal Banner (If just shared or toggled) */}
          {shareLinkModal && (
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  Müşteri Özel Onay Linki Oluşturuldu
                </div>
                <button
                  onClick={() => setShareLinkModal(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Kapat
                </button>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Bu bağlantıyı müşterinizle paylaşabilirsiniz. Müşteri linke tıkladığında teklifi inceleyip doğrudan onaylayabilir.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  readOnly
                  value={shareLinkModal}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono select-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(shareLinkModal)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Kopyalandı" : "Linki Kopyala"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp ile Gönder</span>
                </button>
                <a
                  href={shareLinkModal}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-300"
                >
                  <span>Önizle</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* PDF URL & Generator Section */}
          <div className="flex flex-wrap items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              {isEditingPdf ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="url"
                    placeholder="https://... PDF URL giriniz"
                    value={pdfUrlInput}
                    onChange={(e) => setPdfUrlInput(e.target.value)}
                    className="flex-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSavePdfUrl}
                    disabled={actionLoading === "pdf"}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Kaydet
                  </button>
                  <button
                    onClick={() => setIsEditingPdf(false)}
                    className="px-2 py-1 text-slate-400 hover:text-slate-600"
                  >
                    İptal
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 truncate">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    PDF Belgesi:
                  </span>
                  {detail.quotationPdfUrl ? (
                    <a
                      href={detail.quotationPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 truncate font-medium"
                    >
                      <span className="truncate">{detail.quotationPdfUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Henüz PDF oluşturulmadı</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* If PDF is empty or needs regenerate, trigger microservice */}
              {(!detail.quotationPdfUrl || !detail.quotationPdfUrl.trim()) && (
                <button
                  type="button"
                  onClick={handleGeneratePdf}
                  disabled={generatingPdf}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  {generatingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileCode className="w-3.5 h-3.5" />
                  )}
                  <span>PDF Oluştur</span>
                </button>
              )}

              {!isEditingPdf && (
                <button
                  onClick={() => setIsEditingPdf(true)}
                  className="text-[11px] font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  {detail.quotationPdfUrl ? "URL Değiştir" : "Manuel URL"}
                </button>
              )}
            </div>
          </div>

          {/* Notes */}
          {detail.notes && (
            <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Şartlar & Notlar:
              </span>{" "}
              <span className="text-slate-600 dark:text-slate-400">{detail.notes}</span>
            </div>
          )}

          {/* Items Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Teklif Kalemleri ({detail.items.length})
            </h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Ürün</th>
                    <th className="p-3">Operasyonel Rozetler</th>
                    <th className="p-3 text-right">Adet</th>
                    <th className="p-3 text-right">Birim Fiyat</th>
                    <th className="p-3 text-right">Toplam Fiyat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {detail.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {item.productName}
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-slate-400">{item.description}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.requiresProduction && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] font-medium border border-amber-200 dark:border-amber-800">
                              <Hammer className="w-2.5 h-2.5" /> Üretim Gerektirir
                            </span>
                          )}
                          {item.requiresDelivery && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-[10px] font-medium border border-blue-200 dark:border-blue-800">
                              <Truck className="w-2.5 h-2.5" /> Teslimat Dahil
                            </span>
                          )}
                          {item.requiresInstallation && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 text-[10px] font-medium border border-purple-200 dark:border-purple-800">
                              <Wrench className="w-2.5 h-2.5" /> Montaj Dahil
                            </span>
                          )}
                          {!item.requiresProduction &&
                            !item.requiresDelivery &&
                            !item.requiresInstallation && (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                        </div>
                      </td>
                      <td className="p-3 text-right font-medium text-slate-700 dark:text-slate-300">
                        {item.quantity}
                      </td>
                      <td className="p-3 text-right font-medium text-slate-700 dark:text-slate-300">
                        {item.unitPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                        {item.totalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status History */}
          {detail.statusHistory && detail.statusHistory.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Durum Süreç Geçmişi
              </h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                {detail.statusHistory.map((h, i) => (
                  <div key={h.id || i} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {getQuotationStatusTitle(h.newStatus)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {h.changedAt || h.createdAt ? new Date(h.changedAt || h.createdAt || "").toLocaleString("tr-TR") : ""}
                        </span>
                      </div>
                      {h.reason && (
                        <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 italic">
                          Açıklama: {h.reason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reason input for Reject / Cancel */}
          {reasonPrompt.type && (
            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-3">
              <div className="font-semibold text-xs text-rose-800 dark:text-rose-300">
                {reasonPrompt.type === "reject"
                  ? "Teklifi Reddetme Nedeni"
                  : "Teklifi İptal Etme Nedeni"}
              </div>
              <textarea
                value={reasonPrompt.reason}
                onChange={(e) =>
                  setReasonPrompt((prev) => ({ ...prev, reason: e.target.value }))
                }
                rows={2}
                placeholder="Lütfen gerekçeyi yazınız..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReasonPrompt({ type: null, reason: "" })}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleReasonSubmit}
                  disabled={actionLoading !== null}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
                >
                  İşlemi Tamamla
                </button>
              </div>
            </div>
          )}

          {/* Workflow Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Cancel Button */}
              {detail.status !== QuotationStatus.Cancelled &&
                detail.status !== QuotationStatus.Rejected &&
                detail.status !== QuotationStatus.Approved && (
                  <button
                    type="button"
                    onClick={() => setReasonPrompt({ type: "cancel", reason: "" })}
                    disabled={actionLoading !== null}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Teklifi İptal Et
                  </button>
                )}
            </div>

            <div className="flex items-center gap-2">
              {/* Link Share button (if in approval waiting) */}
              {detail.status === QuotationStatus.WaitingForApproval && (
                <>
                  <button
                    type="button"
                    onClick={() => setShareLinkModal(getApprovalUrl(detail.id))}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Müşteri Onay Linki
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp ile Gönder
                  </button>
                </>
              )}

              {/* Send for approval button */}
              {detail.status === QuotationStatus.Draft && (
                <button
                  type="button"
                  onClick={handleSendForApproval}
                  disabled={actionLoading !== null}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm active:scale-95 transition-all"
                >
                  {actionLoading === "send-for-approval" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Müşteri Onayına Gönder
                </button>
              )}

              {/* Beside SendForApproval: Direct Approve Button */}
              {!detail.isConvertedToOrder && detail.status !== QuotationStatus.Approved && detail.status !== QuotationStatus.Cancelled && (
                <button
                  type="button"
                  onClick={handleDirectApproveClick}
                  disabled={actionLoading !== null}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm active:scale-95 transition-all"
                >
                  {actionLoading === "approve" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <PackageCheck className="w-3.5 h-3.5" />
                  )}
                  {detail.status === QuotationStatus.Accepted
                    ? "Onayla & Sipariş Oluştur"
                    : "Onayla"}
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>

    {/* Pop-up Uyarı Modalı: Müşteri Onayı Bulunmuyor */}
    <Modal
      isOpen={confirmDirectApprove}
      onClose={() => setConfirmDirectApprove(false)}
      title="Müşteri Onayı Bulunmuyor!"
      subtitle="Teklif Doğrudan Onaylama"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40">
          <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-amber-900 dark:text-amber-300">
              Müşteri Onayı Bulunmuyor!
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              Bu teklif müşteri tarafından henüz kabul edilmedi (Durum: <strong>{detail ? getQuotationStatusTitle(detail.status) : ""}</strong>).
            </p>
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
              Müşteri onayı olmadan onaylama işlemine devam edip doğrudan sipariş oluşturmak istiyor musunuz?
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setConfirmDirectApprove(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={executeApprove}
            disabled={actionLoading === "approve"}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
          >
            {actionLoading === "approve" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Evet, Onayla ve Sipariş Oluştur
          </button>
        </div>
      </div>
    </Modal>
  </>
  );
};
