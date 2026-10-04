"use client";

import React, { useState, useEffect, useMemo } from "react";
import { orderService, enumService } from "@/lib/api";
import { OrderListItem, EnumItemDto } from "@/types";
import { StatusBadge } from "@/components/UI/StatusBadge";
import { OrderDetailModal } from "@/components/Orders/OrderDetailModal";
import { QuotationDetailModal } from "@/components/Quotations/QuotationDetailModal";
import { useNotification } from "@/components/UI/NotificationContext";
import {
  createOrderPaymentReminderWhatsAppUrl,
  openWhatsApp,
  formatCurrency,
} from "@/lib/whatsapp";
import {
  CheckSquare,
  Search,
  RefreshCw,
  FileText,
  Calendar,
  Layers,
  DollarSign,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function OrdersPage() {
  const { error, info } = useNotification();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [statuses, setStatuses] = useState<EnumItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | "all">("all");

  // Modals
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [oData, sData] = await Promise.all([
        orderService.getAll(),
        enumService.getOrderStatuses().catch(() => []),
      ]);
      setOrders(oData);
      setStatuses(sData);
    } catch (err: any) {
      error(err.message || "Siparişler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((item) => {
      const matchesSearch =
        item.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Overall financial calculations
  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    [orders]
  );
  const totalPaid = useMemo(
    () => orders.reduce((sum, o) => sum + (o.paidAmount || 0), 0),
    [orders]
  );
  const totalRemaining = useMemo(
    () => orders.reduce((sum, o) => sum + (o.remainingAmount !== undefined ? o.remainingAmount : (o.totalAmount - (o.paidAmount || 0))), 0),
    [orders]
  );

  const handleWhatsAppPaymentClick = (e: React.MouseEvent, o: OrderListItem) => {
    e.stopPropagation();
    const wpUrl = createOrderPaymentReminderWhatsAppUrl({
      phone: o.customerPhone,
      customerName: o.customerName,
      orderNumber: o.orderNumber,
      totalAmount: o.totalAmount,
      paidAmount: o.paidAmount || 0,
      remainingAmount: o.remainingAmount !== undefined ? o.remainingAmount : (o.totalAmount - (o.paidAmount || 0)),
    });
    openWhatsApp(wpUrl);
    info("WhatsApp ödeme hatırlatma mesajı açılıyor...");
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            Sipariş & Ödeme Takibi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Müşteri siparişlerinin aşamaları, tahsilatları ve teslimat süreçleri.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Yenile"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Toplam Sipariş Hacmi
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{orders.length} adet sipariş</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Toplam Tahsil Edilen
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(totalPaid)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Kasaya giren nakit/havale</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Toplam Kalan Bakiye
            </div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {formatCurrency(totalRemaining > 0 ? totalRemaining : 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Bekleyen müşteri alacağı</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Sipariş No veya Müşteri Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white dark:bg-blue-600"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Tümü ({orders.length})
            </button>
            {statuses.map((st) => {
              const count = orders.filter((o) => o.status === st.value).length;
              return (
                <button
                  key={st.value}
                  onClick={() => setStatusFilter(st.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    statusFilter === st.value
                      ? "bg-blue-600 text-white font-semibold"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {st.displayName} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
            <span>Siparişler yükleniyor...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Sipariş bulunamadı
            </div>
            <p className="text-xs text-slate-400">
              Kabul edilen teklifleri onaylayarak buradan siparişe dönüştürebilirsiniz.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
                <tr>
                  <th className="p-4">Sipariş No</th>
                  <th className="p-4">Müşteri</th>
                  <th className="p-4">Sipariş / Teslimat</th>
                  <th className="p-4 text-right">Toplam Tutar</th>
                  <th className="p-4 text-right">Ödenen</th>
                  <th className="p-4 text-right">Kalan Bakiye</th>
                  <th className="p-4">Sipariş Durumu</th>
                  <th className="p-4 text-center">PDF</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((o) => {
                  const paid = o.paidAmount || 0;
                  const remaining = o.remainingAmount !== undefined ? o.remainingAmount : o.totalAmount - paid;
                  const isPaidComplete = remaining <= 0;

                  return (
                    <tr
                      key={o.id}
                      onClick={() => setSelectedOrderId(o.id)}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {o.orderNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(o.createdAt).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {o.customerName}
                        </div>
                        {o.customerPhone && (
                          <div className="text-[11px] text-slate-400">{o.customerPhone}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-slate-700 dark:text-slate-300">
                          {new Date(o.orderDate).toLocaleDateString("tr-TR")}
                        </div>
                        {o.expectedDeliveryDate && (
                          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                            Teslim: {new Date(o.expectedDeliveryDate).toLocaleDateString("tr-TR")}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(o.totalAmount)}
                      </td>
                      <td className="p-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(paid)}
                      </td>
                      <td className="p-4 text-right">
                        {isPaidComplete ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 0 ₺
                          </span>
                        ) : (
                          <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">
                            {formatCurrency(remaining)}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <StatusBadge
                          type="order"
                          status={o.status}
                          size="sm"
                        />
                      </td>
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        {o.orderPdfUrl ? (
                          <a
                            href={o.orderPdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                            title="PDF Belgesini Aç"
                          >
                            <FileText className="w-3.5 h-3.5" /> Belge
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Reminder Button if remaining > 0 */}
                          {!isPaidComplete && (
                            <button
                              type="button"
                              onClick={(e) => handleWhatsAppPaymentClick(e, o)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                              title="WhatsApp ile Kalan Ödeme Bildirimi Gönder"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedOrderId(o.id)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50 flex items-center gap-1 transition-colors"
                          >
                            <span>Detay & Ödeme</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <OrderDetailModal
        orderId={selectedOrderId}
        isOpen={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
        onRefresh={loadData}
        onOpenQuotation={(qId) => {
          setSelectedOrderId(null);
          setSelectedQuotationId(qId);
        }}
      />

      <QuotationDetailModal
        quotationId={selectedQuotationId}
        isOpen={selectedQuotationId !== null}
        onClose={() => setSelectedQuotationId(null)}
        onRefresh={loadData}
      />
    </div>
  );
}
