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
import { Plus, RefreshCw, ChevronRight } from "lucide-react";

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
    <div className="space-y-6">
      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            Genel Bakış
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Satış operasyonları, teklif akışı ve sipariş metrikleri
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateQuotationOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Teklif</span>
          </button>
          <button
            onClick={loadData}
            title="Yenile"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-500" : ""}`} />
            <span className="hidden sm:inline">Yenile</span>
          </button>
        </div>
      </div>

      {/* Corporate KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Teklifler */}
        <div className="p-4 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Toplam Teklifler
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {quotations.length}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {totalQuotationAmount.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ₺
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
            {waitingApprovalCount} onay bekliyor
          </div>
        </div>

        {/* Metric 2: Siparişler */}
        <div className="p-4 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Sipariş Hacmi
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {orders.length}
          </div>
          <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {totalOrderAmount.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ₺
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-blue-700 dark:text-blue-400 font-medium">
            {inProgressOrdersCount} aktif sipariş
          </div>
        </div>

        {/* Metric 3: Müşteriler */}
        <div className="p-4 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Müşteriler
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {customers.length}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Kayıtlı cari kart
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/customers"
              className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center gap-0.5"
            >
              Müşteri Rehberi <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Metric 4: Ürünler */}
        <div className="p-4 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Katalog Ürünleri
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {products.length}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Tanımlı ürün
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/products"
              className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center gap-0.5"
            >
              Ürün Kataloğu <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Two Responsive Columns: Recent Quotations & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Quotations Section */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Son Teklifler
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Oluşturulan en son teklif kayıtları
              </p>
            </div>
            <Link
              href="/quotations"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
            >
              Tümü <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {quotations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Kayıtlı teklif bulunmuyor.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Teklif No / Müşteri</th>
                      <th className="py-2.5 px-4 font-medium text-right">Tutar</th>
                      <th className="py-2.5 px-4 font-medium">Durum</th>
                      <th className="py-2.5 px-4 font-medium text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {quotations.slice(0, 5).map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {q.quotationNumber}
                          </div>
                          <div className="text-[11px] text-slate-500">{q.customerName}</div>
                        </td>
                        <td className="py-2.5 px-4 text-right font-medium text-slate-900 dark:text-slate-100">
                          {q.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                        </td>
                        <td className="py-2.5 px-4">
                          <StatusBadge type="quotation" status={q.status} size="sm" />
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedQuotationId(q.id)}
                            className="px-2 py-1 rounded text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                          >
                            İncele
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {quotations.slice(0, 5).map((q) => (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuotationId(q.id)}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">
                        {q.quotationNumber}
                      </span>
                      <StatusBadge type="quotation" status={q.status} size="sm" />
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {q.customerName}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs pt-1.5 border-t border-slate-100 dark:border-slate-800/70">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {q.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        Detay &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Son Siparişler
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Onaylanan ve yürütülen siparişler
              </p>
            </div>
            <Link
              href="/orders"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
            >
              Tümü <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Kayıtlı sipariş bulunmuyor.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Sipariş No / Müşteri</th>
                      <th className="py-2.5 px-4 font-medium text-right">Tutar</th>
                      <th className="py-2.5 px-4 font-medium">Durum</th>
                      <th className="py-2.5 px-4 font-medium text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {o.orderNumber}
                          </div>
                          <div className="text-[11px] text-slate-500">{o.customerName}</div>
                        </td>
                        <td className="py-2.5 px-4 text-right font-medium text-slate-900 dark:text-slate-100">
                          {o.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                        </td>
                        <td className="py-2.5 px-4">
                          <StatusBadge type="order" status={o.status} size="sm" />
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedOrderId(o.id)}
                            className="px-2 py-1 rounded text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                          >
                            İncele
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {orders.slice(0, 5).map((o) => (
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
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {o.customerName}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs pt-1.5 border-t border-slate-100 dark:border-slate-800/70">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {o.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        Detay &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
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
