"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/UI/Modal";
import { customerService, orderService, quotationService } from "@/lib/api";
import { OrderDetail, OrderStatus, OrderPayment } from "@/types";
import { StatusBadge, getOrderStatusTitle } from "@/components/UI/StatusBadge";
import { useNotification } from "@/components/UI/NotificationContext";
import {
  createOrderPaymentReminderWhatsAppUrl,
  createOrderStatusWhatsAppUrl,
  openWhatsApp,
  formatCurrency,
} from "@/lib/whatsapp";
import {
  Loader2,
  Calendar,
  Package,
  FileText,
  ExternalLink,
  History,
  Hammer,
  Truck,
  Wrench,
  Link as LinkIcon,
  Check,
  CheckCircle2,
  FileCode,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  MessageCircle,
  Share2,
  Clock,
  ArrowRight,
  AlertCircle,
  Copy,
  User,
  MapPin,
  Phone,
} from "lucide-react";

interface OrderDetailModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onOpenQuotation?: (quotationId: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  orderId,
  isOpen,
  onClose,
  onRefresh,
  onOpenQuotation,
}) => {
  const { success, error, info } = useNotification();
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // PDF URL editing / Generating
  const [isEditingPdf, setIsEditingPdf] = useState(false);
  const [pdfUrlInput, setPdfUrlInput] = useState("");
  const [savingPdf, setSavingPdf] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Status updating
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [statusDesc, setStatusDesc] = useState("");

  // Payment Form State
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | "">("");
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("Nakit");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);

  // Link copy feedback
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      loadDetail(orderId);
    } else {
      setDetail(null);
      setIsEditingPdf(false);
      setShowPaymentForm(false);
      setEditingPaymentId(null);
    }
  }, [isOpen, orderId]);

  const loadDetail = async (id: string) => {
    try {
      setLoading(true);
      const data = await orderService.getById(id);
      setDetail(data);
      setPdfUrlInput(data.orderPdfUrl || "");
      setNewStatus(data.status);
    } catch (err: any) {
      error(err.message || "Sipariş detayları alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePdfUrl = async () => {
    if (!orderId) return;
    try {
      setSavingPdf(true);
      await orderService.updatePdfUrl(orderId, pdfUrlInput.trim());
      success("Sipariş PDF URL başarıyla güncellendi.");
      setIsEditingPdf(false);
      await loadDetail(orderId);
      onRefresh();
    } catch (err: any) {
      error(err.message || "PDF URL kaydedilemedi.");
    } finally {
      setSavingPdf(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!detail) return;
    try {
      setGeneratingPdf(true);
      const targetQuotationId = detail.quotationInfo?.quotationId || detail.quotationId;
      let generatedUrl: string | null = null;

      if (targetQuotationId) {
        // 1. İlgili teklif bilgilerini API'den getir: GET http://localhost:5010/api/Quotations/{id}
        const quotationDetail = await quotationService.getById(targetQuotationId);

        // 2. Doğrudan bu teklif verisini PDF servisine (http://localhost:3000/api/documents) gönder
        const res = await fetch("/api/pdf/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: quotationDetail }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || "PDF oluşturulamadı.");
        }
        generatedUrl =
          json.pdfUrl ||
          (quotationDetail.id ? `http://localhost:3000/uploads/${quotationDetail.id}.pdf` : null);
      } else {
        generatedUrl = await orderService.generatePdf(detail);
      }

      if (generatedUrl) {
        // 3. Siparişin içindeki pdfurl'i güncelle
        await orderService.updatePdfUrl(detail.id, generatedUrl);
        success("Sipariş PDF belgesi başarıyla oluşturuldu ve siparişe bağlandı.");
        setPdfUrlInput(generatedUrl);
        await loadDetail(detail.id);
        onRefresh();
      } else {
        error("PDF servisi geçerli bir URL döndürmedi.");
      }
    } catch (err: any) {
      error(err.message || "PDF oluşturulurken hata oluştu.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleStatusChange = async (targetStatus: OrderStatus) => {
    if (!orderId || !detail || detail.status === targetStatus) return;
    try {
      setStatusUpdating(true);
      await orderService.updateStatus(
        orderId,
        targetStatus,
        statusDesc.trim() || undefined
      );
      success(`Sipariş durumu "${getOrderStatusTitle(targetStatus)}" olarak güncellendi.`);
      setStatusDesc("");
      await loadDetail(orderId);
      onRefresh();
    } catch (err: any) {
      error(err.message || "Sipariş durumu güncellenemedi.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const openAddPayment = () => {
    setEditingPaymentId(null);
    // Default to remaining amount if positive
    const remaining = detail ? detail.remainingAmount : 0;
    setPaymentAmount(remaining > 0 ? remaining : "");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("Nakit");
    setPaymentNotes("");
    setShowPaymentForm(true);
  };

  const openEditPayment = (payment: OrderPayment) => {
    setEditingPaymentId(payment.id);
    setPaymentAmount(payment.amount);
    setPaymentDate(
      payment.paymentDate ? payment.paymentDate.split("T")[0] : new Date().toISOString().split("T")[0]
    );
    setPaymentMethod(payment.paymentMethod || "Nakit");
    setPaymentNotes(payment.notes || "");
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !paymentAmount || Number(paymentAmount) <= 0) {
      error("Lütfen geçerli bir ödeme tutarı giriniz.");
      return;
    }

    try {
      setSavingPayment(true);
      if (editingPaymentId) {
        await orderService.updatePayment(orderId, editingPaymentId, {
          amount: Number(paymentAmount),
          paymentDate: new Date(paymentDate).toISOString(),
          paymentMethod,
          notes: paymentNotes.trim() || null,
        });
        success("Ödeme kaydı güncellendi.");
      } else {
        await orderService.addPayment(orderId, {
          amount: Number(paymentAmount),
          paymentDate: new Date(paymentDate).toISOString(),
          paymentMethod,
          notes: paymentNotes.trim() || null,
        });
        success("Ödeme başarıyla eklendi.");
      }

      setShowPaymentForm(false);
      setEditingPaymentId(null);
      await loadDetail(orderId);
      onRefresh();
    } catch (err: any) {
      error(err.message || "Ödeme kaydedilirken hata oluştu.");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!orderId) return;
    if (!confirm("Bu ödeme kaydını silmek istediğinize emin misiniz?")) return;

    try {
      await orderService.deletePayment(orderId, paymentId);
      success("Ödeme kaydı silindi.");
      await loadDetail(orderId);
      onRefresh();
    } catch (err: any) {
      error(err.message || "Ödeme silinemedi.");
    }
  };

  const getCustomerPhone = async (): Promise<string> => {
    if (detail?.customerPhone) return detail.customerPhone;
    if (detail?.customerId) {
      try {
        const cust = await customerService.getById(detail.customerId);
        return cust.phone;
      } catch {}
    }
    return "";
  };

  const handleSendPaymentReminderWhatsApp = async () => {
    if (!detail) return;
    const phone = await getCustomerPhone();
    const wpUrl = createOrderPaymentReminderWhatsAppUrl({
      phone,
      customerName: detail.customerName,
      orderNumber: detail.orderNumber,
      totalAmount: detail.totalAmount,
      paidAmount: detail.paidAmount || 0,
      remainingAmount: detail.remainingAmount !== undefined ? detail.remainingAmount : detail.totalAmount,
    });
    openWhatsApp(wpUrl);
    info("WhatsApp ödeme hatırlatma mesajı hazırlandı.");
  };

  const handleSendOrderStatusWhatsApp = async () => {
    if (!detail) return;
    const phone = await getCustomerPhone();
    const wpUrl = createOrderStatusWhatsAppUrl({
      phone,
      customerName: detail.customerName,
      orderNumber: detail.orderNumber,
      statusText: getOrderStatusTitle(detail.status),
      orderId: detail.id,
    });
    openWhatsApp(wpUrl);
    info("WhatsApp sipariş durumu bilgilendirme mesajı hazırlandı.");
  };

  const getTrackingUrl = (id: string): string => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/siparis-takip/${id}`;
  };

  const copyTrackingLink = (id: string) => {
    const url = getTrackingUrl(id);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    success("Müşteri sipariş takip linki kopyalandı!");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: OrderStatus.Created, label: "Oluşturuldu" },
    { value: OrderStatus.InProduction, label: "Üretimde" },
    { value: OrderStatus.Produced, label: "Üretildi" },
    { value: OrderStatus.Supplied, label: "Tedarik Edildi" },
    { value: OrderStatus.WaitingForDelivery, label: "Teslimat Bekliyor" },
    { value: OrderStatus.AssemblyDatePending, label: "Montaj İçin Gün Verilecek" },
    { value: OrderStatus.AssemblyScheduled, label: "Montaj Planlandı" },
    { value: OrderStatus.Completed, label: "Sipariş Tamamlandı" },
    { value: OrderStatus.Cancelled, label: "İptal Edildi" },
  ];

  const paidAmount = detail?.paidAmount || 0;
  const remainingAmount = detail?.remainingAmount !== undefined ? detail.remainingAmount : (detail ? detail.totalAmount - paidAmount : 0);
  const isFullyPaid = remainingAmount <= 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={detail ? `Sipariş: ${detail.orderNumber}` : "Sipariş Detayı"}
      subtitle={detail ? `Müşteri: ${detail.customerName}` : ""}
      maxWidth="4xl"
    >
      {loading || !detail ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span>Sipariş detayları yükleniyor...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Banner: Status, Quick Switch & Dates */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge
                type="order"
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

              {(detail.quotationInfo || detail.quotationId) && (
                <div className="flex items-center gap-1.5">
                  <a
                    href={`http://localhost:5010/api/Quotations/${detail.quotationInfo?.quotationId || detail.quotationInfo?.id || detail.quotationId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1.5 shadow-sm"
                    title="Teklif API Detayını Aç"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                    <span>
                      Teklif: {detail.quotationInfo?.quotationNumber || `QUO-${(detail.quotationId || "").substring(0, 8)}`} (Satışa Çevrildi)
                    </span>
                  </a>
                  {onOpenQuotation && (
                    <button
                      type="button"
                      onClick={() => {
                        const qid = detail.quotationInfo?.quotationId || detail.quotationInfo?.id || detail.quotationId;
                        if (qid) onOpenQuotation(qid);
                      }}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline px-1"
                    >
                      (Teklifi Aç)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Status Changer Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Durumu Güncelle:
              </span>
              <select
                value={detail.status}
                disabled={statusUpdating}
                onChange={(e) => handleStatusChange(Number(e.target.value) as OrderStatus)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {statusUpdating && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
            </div>
          </div>

          {/* Customer & Delivery Commitments Info Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Müşteri & İletişim
              </div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {detail.customerName}
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                {detail.customerPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> {detail.customerPhone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> Sipariş: {new Date(detail.orderDate).toLocaleDateString("tr-TR")}
                </span>
              </div>
              {detail.customerAddress && (
                <div className="flex items-start gap-1 text-slate-500 text-[11px] leading-snug pt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                  <span>{detail.customerAddress}</span>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-600" /> Taahhüt Edilen Koşullar & Teslimat
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className={`p-2 rounded-lg border text-center ${
                  detail.isAssemblyIncluded !== false
                    ? "bg-purple-50/60 text-purple-900 dark:bg-purple-950/30 dark:text-purple-300 border-purple-200 dark:border-purple-900/60"
                    : "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }`}>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Montaj</div>
                  <div className="font-bold text-xs mt-0.5">
                    {detail.assemblyStatusText || (detail.isAssemblyIncluded !== false ? "Montaj Dahil" : "Montaj Hariç")}
                  </div>
                </div>

                <div className={`p-2 rounded-lg border text-center ${
                  detail.isDeliveryIncluded !== false
                    ? "bg-blue-50/60 text-blue-900 dark:bg-blue-950/30 dark:text-blue-300 border-blue-200 dark:border-blue-900/60"
                    : "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }`}>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Teslimat</div>
                  <div className="font-bold text-xs mt-0.5">
                    {detail.deliveryStatusText || (detail.isDeliveryIncluded !== false ? "Teslimat Dahil" : "Teslimat Hariç")}
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-lg border border-indigo-100 dark:border-indigo-950 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Maksimum Teslim Tarihi:
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {detail.expectedDeliveryDate
                    ? new Date(detail.expectedDeliveryDate).toLocaleDateString("tr-TR")
                    : detail.deliveryDays
                    ? `${detail.deliveryDays} Gün`
                    : "Belirtilmedi"}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Summary Card (Total, Paid, Remaining) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Toplam Sipariş Tutarı
              </div>
              <div className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(detail.totalAmount)}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm">
              <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                <span>Tahsil Edilen (Ödenen)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(paidAmount)}
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border shadow-sm ${
                isFullyPaid
                  ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20"
                  : "border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20"
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between">
                <span className={isFullyPaid ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}>
                  Kalan Bakiye
                </span>
                {isFullyPaid ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                    Ödendi
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                    Bekliyor
                  </span>
                )}
              </div>
              <div
                className={`mt-1 text-xl font-bold ${
                  isFullyPaid
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {formatCurrency(remainingAmount > 0 ? remainingAmount : 0)}
              </div>
            </div>
          </div>

          {/* Quick Action Shortcuts: WhatsApp & Customer Tracking */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              {/* WhatsApp Payment Reminder */}
              <button
                type="button"
                onClick={handleSendPaymentReminderWhatsApp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-sm active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp ile Kalan Ödeme Bildir</span>
              </button>

              {/* WhatsApp Status Update */}
              <button
                type="button"
                onClick={handleSendOrderStatusWhatsApp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-sm active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp ile Sipariş Durumu Gönder</span>
              </button>
            </div>

            {/* Customer Tracking Link Copy/Preview */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => copyTrackingLink(detail.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Kopyalandı" : "Müşteri Takip Linki"}</span>
              </button>

              <a
                href={getTrackingUrl(detail.id)}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Müşteri Takip Sayfasını Aç"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Payment Management Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Ödeme Girişleri & Tahsilat Geçmişi
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Müşteriden alınan peşinat, ara ödeme veya kapanış ödemelerini buradan yönetebilirsiniz.
                </p>
              </div>

              {!showPaymentForm && (
                <button
                  type="button"
                  onClick={openAddPayment}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ödeme Ekle
                </button>
              )}
            </div>

            {/* Payment Add / Edit Inline Form */}
            {showPaymentForm && (
              <form
                onSubmit={handlePaymentSubmit}
                className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3 animate-in fade-in"
              >
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  {editingPaymentId ? "Ödeme Kaydını Düzenle" : "Yeni Tahsilat / Ödeme Girişi"}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ödeme Tutarı (₺) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ödeme Tarihi *
                    </label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ödeme Yöntemi *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Nakit">Nakit</option>
                      <option value="Havale / EFT">Havale / EFT</option>
                      <option value="Kredi Kartı">Kredi Kartı</option>
                      <option value="Çek">Çek</option>
                      <option value="Senet">Senet</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Açıklama / Dekont Notu
                  </label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Örn: Garanti Bankası EFT, 1. Taksit vb."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentForm(false);
                      setEditingPaymentId(null);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={savingPayment}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
                  >
                    {savingPayment && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {editingPaymentId ? "Değişiklikleri Kaydet" : "Ödemeyi Kaydet"}
                  </button>
                </div>
              </form>
            )}

            {/* Payments List Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
                  <tr>
                    <th className="p-3">Tarih</th>
                    <th className="p-3">Yöntem</th>
                    <th className="p-3">Açıklama</th>
                    <th className="p-3 text-right">Tutar</th>
                    <th className="p-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {detail.payments && detail.payments.length > 0 ? (
                    detail.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                          {new Date(p.paymentDate).toLocaleDateString("tr-TR")}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 dark:text-slate-400">
                          {p.notes || "-"}
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditPayment(p)}
                              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Düzenle"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePayment(p.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 text-xs italic">
                        Bu siparişe ait henüz girilmiş bir ödeme kaydı bulunmuyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PDF URL Section & Generator */}
          <div className="flex flex-wrap items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              {isEditingPdf ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="url"
                    placeholder="https://... Sipariş PDF URL giriniz"
                    value={pdfUrlInput}
                    onChange={(e) => setPdfUrlInput(e.target.value)}
                    className="flex-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSavePdfUrl}
                    disabled={savingPdf}
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
                    Sipariş PDF Belgesi:
                  </span>
                  {detail.orderPdfUrl ? (
                    <a
                      href={detail.orderPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{detail.orderPdfUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Belge URL tanımlı değil</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGeneratePdf}
                disabled={generatingPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-xs hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {generatingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileCode className="w-3.5 h-3.5" />
                )}
                <span>PDF Oluştur</span>
              </button>

              {!isEditingPdf && (
                <button
                  onClick={() => setIsEditingPdf(true)}
                  className="text-[11px] font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1 shrink-0 px-2 py-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  {detail.orderPdfUrl ? "URL Düzenle" : "URL Ekle"}
                </button>
              )}
            </div>
          </div>

          {/* Notes */}
          {detail.notes && (
            <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Sipariş Notları:
              </span>{" "}
              <span className="text-slate-600 dark:text-slate-400">{detail.notes}</span>
            </div>
          )}

          {/* Items Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Sipariş Kalemleri ({detail.items.length})
            </h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Ürün</th>
                    <th className="p-3">Gereksinimler</th>
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
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-medium border border-amber-200 dark:border-amber-800">
                              <Hammer className="w-2.5 h-2.5" /> Üretim Gerektirir
                            </span>
                          )}
                          {item.requiresDelivery && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-[10px] font-medium border border-blue-200 dark:border-blue-800">
                              <Truck className="w-2.5 h-2.5" /> Teslimat Dahil
                            </span>
                          )}
                          {item.requiresInstallation && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 text-[10px] font-medium border border-purple-200 dark:border-purple-800">
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
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.totalPrice)}
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
                Sipariş Süreç Tarihçesi
              </h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                {detail.statusHistory.map((h, i) => (
                  <div key={h.id || i} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {getOrderStatusTitle(h.newStatus)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {h.createdAt || h.changedAt ? new Date(h.createdAt || h.changedAt || "").toLocaleString("tr-TR") : ""}
                        </span>
                      </div>
                      {h.description && (
                        <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 italic">
                          Açıklama: {h.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
