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
import { Search, RefreshCw, MessageCircle } from "lucide-react";

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

  // Financial calculations
  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    [orders]
  );
  const totalPaid = useMemo(
    () => orders.reduce((sum, o) => sum + (o.paidAmount || 0), 0),
    [orders]
  );
  const totalRemaining = useMemo(
    () =>
      orders.reduce(
        (sum, o) =>
          sum +
          (o.remainingAmount !== undefined
            ? o.remainingAmount
            : o.totalAmount - (o.paidAmount || 0)),
        0
      ),
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
      remainingAmount:
        o.remainingAmount !== undefined
          ? o.remainingAmount
          : o.totalAmount - (o.paidAmount || 0),
    });

    if (!wpUrl) {
      info("Müşteri telefon numarası tanımlı değil.");
      return;
    }
    openWhatsApp(wpUrl);
  };

  return (
    <div className="space-y-5">
      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            Sipariş Takibi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Onaylanan siparişlerin teslimat, ödeme ve operasyonel süreçleri
          </p>
        </div>

        <button
          onClick={loadData}
          title="Yenile"
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-500" : ""}`} />
          <span>Yenile</span>
        </button>
      </div>

      {/* Corporate Financial KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Toplam Sipariş Hacmi
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {orders.length} adet sipariş
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Tahsil Edilen
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">
            {formatCurrency(totalPaid)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Kasaya giren tutar
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            Kalan Bakiye
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1.5">
            {formatCurrency(totalRemaining > 0 ? totalRemaining : 0)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Müşteri açık hesabı
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg p-3 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Sipariş No veya Müşteri Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white dark:bg-blue-600 font-semibold"
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
                  className={`px-2.5 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
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

      {/* Orders List */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            <span>Siparişler yükleniyor...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Sipariş bulunamadı
            </div>
            <p className="text-xs text-slate-400">
              Onaylanan teklifler siparişe dönüştüğünde burada listelenir.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Sipariş No</th>
                    <th className="py-3 px-4 font-semibold">Müşteri</th>
                    <th className="py-3 px-4 font-semibold">Tarih</th>
                    <th className="py-3 px-4 font-semibold text-right">Tutar</th>
                    <th className="py-3 px-4 font-semibold text-right">Ödenen</th>
                    <th className="py-3 px-4 font-semibold text-right">Kalan</th>
                    <th className="py-3 px-4 font-semibold">Durum</th>
                    <th className="py-3 px-4 font-semibold text-center">PDF</th>
                    <th className="py-3 px-4 font-semibold text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.map((o) => {
                    const paid = o.paidAmount || 0;
                    const remaining =
                      o.remainingAmount !== undefined
                        ? o.remainingAmount
                        : o.totalAmount - paid;
                    const isPaidComplete = remaining <= 0;

                    return (
                      <tr
                        key={o.id}
                        onClick={() => setSelectedOrderId(o.id)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {o.orderNumber}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {o.customerName}
                          </div>
                          {o.customerPhone && (
                            <div className="text-[11px] text-slate-400">{o.customerPhone}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {new Date(o.orderDate).toLocaleDateString("tr-TR")}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(o.totalAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(paid)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isPaidComplete ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">0 ₺</span>
                          ) : (
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                              {formatCurrency(remaining)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge type="order" status={o.status} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          {o.orderPdfUrl ? (
                            <a
                              href={o.orderPdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-medium text-blue-600 hover:underline"
                            >
                              PDF
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {!isPaidComplete && (
                              <button
                                type="button"
                                onClick={(e) => handleWhatsAppPaymentClick(e, o)}
                                className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                title="WhatsApp Ödeme Hatırlatması"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedOrderId(o.id)}
                              className="px-2 py-1 rounded text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              Detay
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.map((o) => {
                const paid = o.paidAmount || 0;
                const remaining =
                  o.remainingAmount !== undefined
                    ? o.remainingAmount
                    : o.totalAmount - paid;
                const isPaidComplete = remaining <= 0;

                return (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOrderId(o.id)}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">
                        {o.orderNumber}
                      </span>
                      <StatusBadge type="order" status={o.status} size="sm" />
                    </div>
                    <div className="text-xs text-slate-800 dark:text-slate-200 mt-1 font-medium">
                      {o.customerName}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(o.orderDate).toLocaleDateString("tr-TR")}
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-800/40 p-2 rounded text-[11px]">
                      <div>
                        <div className="text-slate-400">Toplam</div>
                        <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                          {formatCurrency(o.totalAmount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">Ödenen</div>
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {formatCurrency(paid)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">Kalan</div>
                        <div className={`font-semibold mt-0.5 ${isPaidComplete ? "text-slate-400" : "text-amber-600 dark:text-amber-400"}`}>
                          {isPaidComplete ? "0 ₺" : formatCurrency(remaining)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {!isPaidComplete && (
                        <button
                          type="button"
                          onClick={(e) => handleWhatsAppPaymentClick(e, o)}
                          className="px-2 py-1 rounded text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 inline-flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      )}
                      {o.orderPdfUrl && (
                        <a
                          href={o.orderPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded text-xs font-medium text-blue-600 border border-blue-200 dark:border-blue-800"
                        >
                          PDF
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedOrderId(o.id)}
                        className="px-2.5 py-1 rounded text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800"
                      >
                        Detay
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
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
