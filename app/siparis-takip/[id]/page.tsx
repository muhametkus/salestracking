"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { orderService } from "@/lib/api";
import { OrderDetail, OrderStatus } from "@/types";
import { StatusBadge, getOrderStatusTitle } from "@/components/UI/StatusBadge";
import { formatCurrency } from "@/lib/whatsapp";
import {
  FileText,
  MessageCircle,
  Loader2,
  X,
} from "lucide-react";

export default function CustomerOrderTrackingPage() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await orderService.getById(id);
        setOrder(data);
      } catch (err: any) {
        setErrorMsg(err.message || "Sipariş bilgileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm font-medium text-slate-500">Sipariş takibi yükleniyor...</p>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#111827] rounded-lg p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-center shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
            <X className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Sipariş Bulunamadı
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {errorMsg || "Belirtilen bağlantıya ait sipariş kaydı mevcut değil veya kaldırılmış olabilir."}
          </p>
        </div>
      </div>
    );
  }

  // Workflow steps definition
  const workflowSteps = [
    { status: OrderStatus.Created, label: "Oluşturuldu" },
    { status: OrderStatus.InProduction, label: "Üretimde" },
    { status: OrderStatus.Produced, label: "Üretildi" },
    { status: OrderStatus.Supplied, label: "Tedarik Edildi" },
    { status: OrderStatus.WaitingForDelivery, label: "Teslimat Bekliyor" },
    { status: OrderStatus.AssemblyDatePending, label: "Montaj Günü Belirleniyor" },
    { status: OrderStatus.AssemblyScheduled, label: "Montaj Planlandı" },
    { status: OrderStatus.Completed, label: "Tamamlandı" },
  ];

  const currentStepIndex = workflowSteps.findIndex((s) => s.status === order.status);
  const paid = order.paidAmount || 0;
  const remaining = order.remainingAmount !== undefined ? order.remainingAmount : order.totalAmount - paid;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Brand / Top Header */}
        <div className="bg-white dark:bg-[#111827] p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Canlı Sipariş Takip Paneli
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Sipariş #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sayın <strong>{order.customerName}</strong>, siparişinizin güncel durumunu buradan takip edebilirsiniz.
            </p>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end gap-1.5 shrink-0">
            <StatusBadge type="order" status={order.status} size="md" />
            <span className="text-[11px] text-slate-400">
              Tarih: {new Date(order.orderDate).toLocaleDateString("tr-TR")}
            </span>
          </div>
        </div>

        {/* Dynamic Status Progress Tracker */}
        <div className="bg-white dark:bg-[#111827] p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Sipariş Süreç Aşamaları
            </h3>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Güncel: {getOrderStatusTitle(order.status)}
            </span>
          </div>

          {/* Stepper Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {workflowSteps.map((step, idx) => {
              const isCompleted = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={step.status}
                  className={`p-3 rounded-md border text-xs transition-colors ${
                    isCurrent
                      ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold"
                      : isCompleted
                      ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 text-slate-800 dark:text-slate-200"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-slate-400 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400">0{idx + 1}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isCurrent
                          ? "bg-blue-600"
                          : isCompleted
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                    />
                  </div>
                  <div className="leading-snug">{step.label}</div>
                  <div className="text-[10px] mt-1 text-slate-500">
                    {isCurrent ? "Mevcut Aşama" : isCompleted ? "Tamamlandı" : "Bekliyor"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial & Delivery Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Financial Breakdown */}
          <div className="p-4 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Ödeme & Bakiye
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Toplam Tutar:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Tahsil Edilen:</span>
                <span>{formatCurrency(paid)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 font-semibold">
                <span>Kalan Bakiye:</span>
                <span className={remaining <= 0 ? "text-emerald-600" : "text-amber-600"}>
                  {remaining <= 0 ? "0 ₺ (Ödendi)" : formatCurrency(remaining)}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Assembly Info */}
          <div className="p-4 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Teslimat & Montaj
            </div>
            <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400">Planlanan Teslimat: </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {order.expectedDeliveryDate
                    ? new Date(order.expectedDeliveryDate).toLocaleDateString("tr-TR")
                    : "Planlama aşamasında"}
                </span>
              </div>
              {order.customerAddress && (
                <div className="pt-1 text-[11px] text-slate-500 leading-snug">
                  Adres: {order.customerAddress}
                </div>
              )}
            </div>
          </div>

          {/* Direct Documents / Contact */}
          <div className="p-4 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Belgeler & İletişim
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Sipariş sözleşmenizi görüntüleyebilir veya temsilciye yazabilirsiniz.
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              {order.orderPdfUrl && (
                <a
                  href={order.orderPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sipariş PDF</span>
                </a>
              )}

              <a
                href="https://wa.me/"
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Müşteri Temsilcisi</span>
              </a>
            </div>
          </div>
        </div>

        {/* Order Items Section */}
        <div className="bg-white dark:bg-[#111827] p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Siparişteki Ürünler
            </h3>
            <span className="text-[11px] text-slate-400">
              {order.items.length} Kalem
            </span>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
                <tr>
                  <th className="py-2.5 px-3.5">Ürün Adı</th>
                  <th className="py-2.5 px-3.5">Hizmet Kapsamı</th>
                  <th className="py-2.5 px-3.5 text-right">Adet</th>
                  <th className="py-2.5 px-3.5 text-right">Birim Fiyat</th>
                  <th className="py-2.5 px-3.5 text-right">Toplam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.productName}
                      </div>
                      {item.description && (
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-1 flex-wrap text-[10px]">
                        {item.requiresProduction && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                            Üretim
                          </span>
                        )}
                        {item.requiresDelivery && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                            Teslimat
                          </span>
                        )}
                        {item.requiresInstallation && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
                            Montaj
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-medium text-slate-700 dark:text-slate-300">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-slate-700 dark:text-slate-300">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            {order.items.map((item) => (
              <div key={item.id} className="p-3 bg-white dark:bg-[#111827] space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-xs text-slate-900 dark:text-white">
                    {item.productName}
                  </div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white shrink-0">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>

                {item.description && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {item.description}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <span>Miktar: {item.quantity} Adet</span>
                  <span>Birim: {formatCurrency(item.unitPrice)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 py-3">
          SalesTracking Kurumsal Satış & Sipariş Takip Sistemi
        </div>
      </div>
    </div>
  );
}
