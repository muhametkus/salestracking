import React from "react";
import { QuotationStatus, OrderStatus } from "@/types";

interface StatusBadgeProps {
  type: "quotation" | "order";
  status: QuotationStatus | OrderStatus;
  statusText?: string;
  size?: "sm" | "md";
}

export const getQuotationStatusTitle = (status: QuotationStatus): string => {
  switch (status) {
    case QuotationStatus.Draft:
      return "Taslak";
    case QuotationStatus.WaitingForApproval:
      return "Müşteri Onayı Bekliyor";
    case QuotationStatus.Accepted:
      return "Müşteri Kabul Etti";
    case QuotationStatus.Rejected:
      return "Reddedildi";
    case QuotationStatus.Cancelled:
      return "İptal Edildi";
    case QuotationStatus.Approved:
      return "Onaylandı (Sipariş)";
    default:
      return "Bilinmiyor";
  }
};

export const getOrderStatusTitle = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.Created:
      return "Oluşturuldu";
    case OrderStatus.InProduction:
      return "Üretimde";
    case OrderStatus.Produced:
      return "Üretildi";
    case OrderStatus.Supplied:
      return "Tedarik Edildi";
    case OrderStatus.WaitingForDelivery:
      return "Teslimat Bekliyor";
    case OrderStatus.AssemblyDatePending:
      return "Montaj Günü Bekleniyor";
    case OrderStatus.AssemblyScheduled:
      return "Montaj Planlandı";
    case OrderStatus.Completed:
      return "Tamamlandı";
    case OrderStatus.Cancelled:
      return "İptal Edildi";
    case OrderStatus.InProgress:
      return "İşlemde";
    default:
      return "Bilinmiyor";
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  status,
  size = "md",
}) => {
  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2 py-0.5 gap-1.5 font-medium rounded"
      : "text-xs px-2.5 py-1 gap-1.5 font-medium rounded-md";

  if (type === "quotation") {
    const qStatus = status as QuotationStatus;
    const title = getQuotationStatusTitle(qStatus);

    switch (qStatus) {
      case QuotationStatus.Draft:
        return (
          <span className={`inline-flex items-center bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>{title}</span>
          </span>
        );
      case QuotationStatus.WaitingForApproval:
        return (
          <span className={`inline-flex items-center bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>{title}</span>
          </span>
        );
      case QuotationStatus.Accepted:
        return (
          <span className={`inline-flex items-center bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            <span>{title}</span>
          </span>
        );
      case QuotationStatus.Rejected:
        return (
          <span className={`inline-flex items-center bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <span>{title}</span>
          </span>
        );
      case QuotationStatus.Cancelled:
        return (
          <span className={`inline-flex items-center bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
            <span>{title}</span>
          </span>
        );
      case QuotationStatus.Approved:
        return (
          <span className={`inline-flex items-center bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>{title}</span>
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>{title}</span>
          </span>
        );
    }
  }

  // Order status
  const oStatus = status as OrderStatus;
  const oTitle = getOrderStatusTitle(oStatus);

  switch (oStatus) {
    case OrderStatus.Created:
      return (
        <span className={`inline-flex items-center bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
          <span>{oTitle}</span>
        </span>
      );
    case OrderStatus.InProduction:
      return (
        <span className={`inline-flex items-center bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          <span>{oTitle}</span>
        </span>
      );
    case OrderStatus.Produced:
      return (
        <span className={`inline-flex items-center bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900/60 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
          <span>{oTitle}</span>
        </span>
      );
    case OrderStatus.Supplied:
      return (
        <span className={`inline-flex items-center bg-cyan-50 text-cyan-800 border border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900/60 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
          <span>{oTitle}</span>
        </span>
      );
    case OrderStatus.WaitingForDelivery:
      return (
        <span className={`inline-flex items-center bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
          <span>{oTitle}</span>
        </span>
      );
    case OrderStatus.AssemblyDatePending:
      return (
        <span className={`inline-flex items-center bg-purple-50 text-purple-800 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
          <span>{oTitle}</span>
        </span>
      );
    case OrderStatus.AssemblyScheduled:
      return (
        <span className={`inline-flex items-center bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/60 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
          <span>{oTitle}</span>
        </span>
      );
    case OrderStatus.Completed:
      return (
        <span className={`inline-flex items-center bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>{oTitle}</span>
        </span>
      );
    case OrderStatus.Cancelled:
      return (
        <span className={`inline-flex items-center bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
          <span>{oTitle}</span>
        </span>
      );
    case OrderStatus.InProgress:
      return (
        <span className={`inline-flex items-center bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/60 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
          <span>{oTitle}</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          <span>{oTitle}</span>
        </span>
      );
  }
};
