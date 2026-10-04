"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { orderService } from "@/lib/api";
import { OrderDetail, OrderStatus } from "@/types";
import { StatusBadge, getOrderStatusTitle } from "@/components/UI/StatusBadge";
import { formatCurrency } from "@/lib/whatsapp";
import {
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  Wrench,
  Hammer,
  FileText,
  ExternalLink,
  MessageCircle,
  MapPin,
  DollarSign,
  ShieldCheck,
  AlertCircle,
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">Sipariş takibi yükleniyor...</p>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center shadow-lg space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Sipariş Bulunamadı
          </h2>
          <p className="text-xs text-slate-500">
            {errorMsg || "Belirtilen bağlantıya ait sipariş kaydı mevcut değil veya kaldırılmış olabilir."}
          </p>
        </div>
      </div>
    );
  }

  // Workflow steps definition
  const workflowSteps = [
    { status: OrderStatus.Created, label: "Oluşturuldu", icon: Clock },
    { status: OrderStatus.InProduction, label: "Üretimde", icon: Hammer },
    { status: OrderStatus.Produced, label: "Üretildi", icon: CheckCircle2 },
    { status: OrderStatus.Supplied, label: "Tedarik Edildi", icon: Package },
    { status: OrderStatus.WaitingForDelivery, label: "Teslimat Bekliyor", icon: Truck },
    { status: OrderStatus.AssemblyDatePending, label: "Montaj Günü Belirleniyor", icon: Calendar },
    { status: OrderStatus.AssemblyScheduled, label: "Montaj Planlandı", icon: Wrench },
    { status: OrderStatus.Completed, label: "Sipariş Tamamlandı", icon: ShieldCheck },
  ];

  const currentStepIndex = workflowSteps.findIndex((s) => s.status === order.status);
  const paid = order.paidAmount || 0;
  const remaining = order.remainingAmount !== undefined ? order.remainingAmount : order.totalAmount - paid;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Brand / Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2">
              <Package className="w-3.5 h-3.5" />
              Canlı Sipariş Takip Paneli
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Sipariş #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Sayın <strong>{order.customerName}</strong>, siparişinizin durumunu anlık olarak buradan takip edebilirsiniz.
            </p>
          </div>

          <div className="flex sm:flex-col items-end gap-1">
            <StatusBadge type="order" status={order.status} size="md" />
            <span className="text-[11px] text-slate-400 mt-1">
              Sipariş Tarihi: {new Date(order.orderDate).toLocaleDateString("tr-TR")}
            </span>
          </div>
        </div>

        {/* Dynamic Status Progress Tracker */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Sipariş Süreç Aşamaları
            </h3>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Güncel Durum: {getOrderStatusTitle(order.status)}
            </span>
          </div>

          {/* Stepper Timeline */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {workflowSteps.map((step, idx) => {
              const isCompleted = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;
              const Icon = step.icon;

              return (
                <div
                  key={step.status}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/50 ring-2 ring-blue-400/40"
                      : isCompleted
                      ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20"
                      : "border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                        isCurrent
                          ? "bg-blue-600 text-white"
                          : isCompleted
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {step.label}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {isCurrent ? "Şu anki aşama" : isCompleted ? "Tamamlandı" : "Sıradaki"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial & Delivery Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Financial Breakdown */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Ödeme & Bakiye
            </div>
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Toplam Tutar:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Yapılan Ödeme:</span>
                <span>{formatCurrency(paid)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
                <span>Kalan Bakiye:</span>
                <span className={remaining <= 0 ? "text-emerald-600" : "text-amber-600"}>
                  {remaining <= 0 ? "Ödendi (0 ₺)" : formatCurrency(remaining)}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Assembly Info */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-600" />
              Teslimat & Montaj
            </div>
            <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400">Öngörülen Teslim: </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {order.expectedDeliveryDate
                    ? new Date(order.expectedDeliveryDate).toLocaleDateString("tr-TR")
                    : "Planlama aşamasında"}
                </span>
              </div>
              {order.customerAddress && (
                <div className="pt-1">
                  <div className="flex items-start gap-1 text-[11px] text-slate-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                    <span>{order.customerAddress}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Direct Documents / Contact */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                Belgeler & İletişim
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Sipariş sözleşmenizi görüntüleyebilir veya firma ile doğrudan iletişime geçebilirsiniz.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {order.orderPdfUrl && (
                <a
                  href={order.orderPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-white transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Sipariş PDF İndir
                </a>
              )}

              <a
                href="https://wa.me/"
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Müşteri Temsilcisine Yaz
              </a>
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Siparişteki Ürünler ({order.items.length})
          </h3>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
                <tr>
                  <th className="p-3.5">Ürün Adı</th>
                  <th className="p-3.5">Hizmet Kapsamı</th>
                  <th className="p-3.5 text-right">Adet</th>
                  <th className="p-3.5 text-right">Birim Fiyat</th>
                  <th className="p-3.5 text-right">Toplam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {item.productName}
                      </div>
                      {item.description && (
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.requiresProduction && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] font-medium border border-amber-200 dark:border-amber-800">
                            <Hammer className="w-2.5 h-2.5" /> Üretim Gerektirir
                          </span>
                        )}
                        {item.requiresDelivery && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 text-[10px] font-medium border border-blue-200 dark:border-blue-800">
                            <Truck className="w-2.5 h-2.5" /> Teslimat Dahil
                          </span>
                        )}
                        {item.requiresInstallation && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 text-[10px] font-medium border border-purple-200 dark:border-purple-800">
                            <Wrench className="w-2.5 h-2.5" /> Montaj Dahil
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-right font-medium text-slate-700 dark:text-slate-300">
                      {item.quantity}
                    </td>
                    <td className="p-3.5 text-right font-medium text-slate-700 dark:text-slate-300">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 py-4">
          SalesTracking Sipariş ve Satış Yönetim Sistemi © 2026. Güvenli Canlı Takip Bağlantısı.
        </div>
      </div>
    </div>
  );
}
