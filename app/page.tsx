"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  quotationService,
  orderService,
  customerService,
  productService,
} from "@/lib/api";
import {
  QuotationListItem,
  OrderListItem,
  CustomerListItem,
  ProductListItem,
  QuotationStatus,
  OrderStatus,
} from "@/types";
import { StatusBadge } from "@/components/UI/StatusBadge";
import { QuotationDetailModal } from "@/components/Quotations/QuotationDetailModal";
import { OrderDetailModal } from "@/components/Orders/OrderDetailModal";
import { CreateQuotationModal } from "@/components/Quotations/CreateQuotationModal";
import {
  TrendingUp,
  FileSpreadsheet,
  CheckSquare,
  Users,
  Package,
  Clock,
  ArrowRight,
  Plus,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export default function DashboardPage() {
  const [quotations, setQuotations] = useState<QuotationListItem[]>([]);
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isCreateQuotationOpen, setIsCreateQuotationOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [qData, oData, cData, pData] = await Promise.all([
        quotationService.getAll().catch(() => []),
        orderService.getAll().catch(() => []),
        customerService.getAll().catch(() => []),
        productService.getAll().catch(() => []),
      ]);
      setQuotations(qData);
      setOrders(oData);
      setCustomers(cData);
      setProducts(pData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Metrics
  const totalQuotationAmount = quotations.reduce((sum, q) => sum + q.totalAmount, 0);
  const totalOrderAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const waitingApprovalCount = quotations.filter(
    (q) => q.status === QuotationStatus.WaitingForApproval
  ).length;
  const inProgressOrdersCount = orders.filter(
    (o) => o.status === OrderStatus.InProgress || o.status === OrderStatus.Created
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Card */}
      <div className="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 text-slate-900 dark:text-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Satış Takip Sistemi
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Satış ve Teklif Yönetim Paneli
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Müşterilerinize özel teklif linkleri oluşturun, onay süreçlerini takip edin ve tek tıkla siparişe dönüştürün.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsCreateQuotationOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Teklif Oluştur</span>
          </button>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Yenile</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Toplam Teklifler
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {quotations.length}
            </div>
            <div className="text-xs font-semibold text-slate-500">
              {totalQuotationAmount.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ₺
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{waitingApprovalCount} onay bekleyen</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sipariş Hacmi
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {orders.length}
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {totalOrderAmount.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ₺
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{inProgressOrdersCount} aktif sipariş</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Müşteri Sayısı
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {customers.length}
            </div>
            <Link
              href="/customers"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
            >
              Rehber <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Kayıtlı müşteri ve firmalar
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Katalog Ürünleri
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {products.length}
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
            >
              Katalog <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Fiyat ve operasyon tanımlı ürün
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Quotations & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotations */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Son Teklifler
              </h3>
              <p className="text-[11px] text-slate-500">Müşterilere verilen en son satış teklifleri</p>
            </div>
            <Link
              href="/quotations"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Tümünü Gör <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {quotations.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              Henüz teklif bulunmuyor.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Teklif No / Müşteri</th>
                    <th className="pb-3 font-semibold">Tutar</th>
                    <th className="pb-3 font-semibold">Durum</th>
                    <th className="pb-3 text-right font-semibold">İncele</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {quotations.slice(0, 5).map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {q.quotationNumber}
                        </div>
                        <div className="text-[11px] text-slate-500">{q.customerName}</div>
                      </td>
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {q.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                      </td>
                      <td className="py-3">
                        <StatusBadge
                          type="quotation"
                          status={q.status}
                          size="sm"
                        />
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedQuotationId(q.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40 transition-colors"
                        >
                          Detay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Son Siparişler
              </h3>
              <p className="text-[11px] text-slate-500">Onaylanan ve yürütülen siparişler</p>
            </div>
            <Link
              href="/orders"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Tümünü Gör <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              Henüz sipariş bulunmuyor.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Sipariş No / Müşteri</th>
                    <th className="pb-3 font-semibold">Tutar</th>
                    <th className="pb-3 font-semibold">Durum</th>
                    <th className="pb-3 text-right font-semibold">İncele</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {o.orderNumber}
                        </div>
                        <div className="text-[11px] text-slate-500">{o.customerName}</div>
                      </td>
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {o.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                      </td>
                      <td className="py-3">
                        <StatusBadge
                          type="order"
                          status={o.status}
                          size="sm"
                        />
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedOrderId(o.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40 transition-colors"
                        >
                          Detay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateQuotationModal
        isOpen={isCreateQuotationOpen}
        onClose={() => setIsCreateQuotationOpen(false)}
        onSuccess={loadData}
      />

      <QuotationDetailModal
        quotationId={selectedQuotationId}
        isOpen={selectedQuotationId !== null}
        onClose={() => setSelectedQuotationId(null)}
        onRefresh={loadData}
      />

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
    </div>
  );
}
