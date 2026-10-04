import React from "react";
import { QuotationStatus, OrderStatus } from "@/types";
import {
  FileEdit,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  PackageCheck,
  PlayCircle,
} from "lucide-react";

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
      return "Montaj İçin Gün Verilecek";
    case OrderStatus.AssemblyScheduled:
      return "Montaj Planlandı";
    case OrderStatus.Completed:
      return "Sipariş Tamamlandı";
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
      ? "text-[11px] px-2.5 py-0.5 gap-1.5 font-medium"
      : "text-xs px-3 py-1 gap-1.5 font-semibold";

  if (type === "quotation") {
    const qStatus = status as QuotationStatus;
    const title = getQuotationStatusTitle(qStatus);

    switch (qStatus) {
      case QuotationStatus.Draft:
        return (
          <span
            className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-300/80 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 ${sizeClasses}`}
          >
            <FileEdit className="w-3.5 h-3.5 text-slate-500" />
            {title}
          </span>
        );
      case QuotationStatus.WaitingForApproval:
        return (
          <span
            className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/80 ${sizeClasses}`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            {title}
          </span>
        );
      case QuotationStatus.Accepted:
        return (
          <span
            className={`inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/80 ${sizeClasses}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            {title}
          </span>
        );
      case QuotationStatus.Rejected:
        return (
          <span
            className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/80 ${sizeClasses}`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            {title}
          </span>
        );
      case QuotationStatus.Cancelled:
        return (
          <span
            className={`inline-flex items-center rounded-full bg-zinc-100 text-zinc-700 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 ${sizeClasses}`}
          >
            <Ban className="w-3.5 h-3.5 text-zinc-500" />
            {title}
          </span>
        );
      case QuotationStatus.Approved:
        return (
          <span
            className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80 ${sizeClasses}`}
          >
            <PackageCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {title}
          </span>
        );
      default:
        return <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}>{title}</span>;
    }
  }

  // Order status
  const oStatus = status as OrderStatus;
  const oTitle = getOrderStatusTitle(oStatus);

  switch (oStatus) {
    case OrderStatus.Created:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-sky-50 text-sky-800 border border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/80 ${sizeClasses}`}
        >
          <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          {oTitle}
        </span>
      );
    case OrderStatus.InProduction:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/80 ${sizeClasses}`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mr-0.5" />
          {oTitle}
        </span>
      );
    case OrderStatus.Produced:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-teal-50 text-teal-800 border border-teal-300 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/80 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          {oTitle}
        </span>
      );
    case OrderStatus.Supplied:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-cyan-50 text-cyan-800 border border-cyan-300 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/80 ${sizeClasses}`}
        >
          <PackageCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          {oTitle}
        </span>
      );
    case OrderStatus.WaitingForDelivery:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-blue-50 text-blue-800 border border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/80 ${sizeClasses}`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 mr-0.5" />
          {oTitle}
        </span>
      );
    case OrderStatus.AssemblyDatePending:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-purple-50 text-purple-800 border border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/80 ${sizeClasses}`}
        >
          <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          {oTitle}
        </span>
      );
    case OrderStatus.AssemblyScheduled:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-indigo-50 text-indigo-800 border border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/80 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          {oTitle}
        </span>
      );
    case OrderStatus.Completed:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          {oTitle}
        </span>
      );
    case OrderStatus.Cancelled:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/80 ${sizeClasses}`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          {oTitle}
        </span>
      );
    case OrderStatus.InProgress:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-indigo-50 text-indigo-800 border border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/80 ${sizeClasses}`}
        >
          <PlayCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          {oTitle}
        </span>
      );
    default:
      return <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}>{oTitle}</span>;
  }
};
