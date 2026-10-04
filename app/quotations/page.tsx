"use client";

import React, { useState, useEffect, useMemo } from "react";
import { quotationService, enumService } from "@/lib/api";
import { QuotationListItem, QuotationStatus, EnumItemDto } from "@/types";
import { StatusBadge, getQuotationStatusTitle } from "@/components/UI/StatusBadge";
import { QuotationDetailModal } from "@/components/Quotations/QuotationDetailModal";
import { CreateQuotationModal } from "@/components/Quotations/CreateQuotationModal";
import { useNotification } from "@/components/UI/NotificationContext";
import {
  FileSpreadsheet,
  Plus,
  Search,
  RefreshCw,
  Send,
  PackageCheck,
  FileText,
} from "lucide-react";

export default function QuotationsPage() {
  const { success, error } = useNotification();
  const [quotations, setQuotations] = useState<QuotationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | "all">("all");

  // Modals
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const qData = await quotationService.getAll();
      setQuotations(qData);
    } catch (err: any) {
      error(err.message || "Teklifler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredQuotations = useMemo(() => {
    return quotations.filter((item) => {
      const matchesSearch =
        item.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quotations, searchQuery, statusFilter]);

  const handleQuickAction = async (
    e: React.MouseEvent,
    id: string,
    action: "send-for-approval" | "approve"
  ) => {
    e.stopPropagation();
    try {
      if (action === "send-for-approval") {
        await quotationService.sendForApproval(id);
        success("Teklif müşteri onayına gönderildi.");
      } else if (action === "approve") {
        const res = await quotationService.approve(id);
        success(`Teklif onaylandı ve sipariş (#${res.orderId.substring(0, 8)}) oluşturuldu!`);
      }
      loadData();
    } catch (err: any) {
      error(err.message || "İşlem gerçekleştirilemedi.");
    }
  };

  const statusOptions = [
    { value: QuotationStatus.Draft, label: "Taslak" },
    { value: QuotationStatus.WaitingForApproval, label: "Müşteri Onayı Bekliyor" },
    { value: QuotationStatus.Accepted, label: "Müşteri Kabul Etti" },
    { value: QuotationStatus.Approved, label: "Onaylandı" },
    { value: QuotationStatus.Rejected, label: "Reddedildi" },
    { value: QuotationStatus.Cancelled, label: "İptal Edildi" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            Teklif Listesi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Müşterilere verilen tüm satış tekliflerini izleyin ve onay akışını yönetin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Yenile"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] hover:bg-slate-50 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Teklif Oluştur</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Teklif No veya Müşteri Ara..."
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
              Tümü ({quotations.length})
            </button>
            {statusOptions.map((st) => {
              const count = quotations.filter((q) => q.status === st.value).length;
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
                  {st.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
            <span>Teklifler getiriliyor...</span>
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Eşleşen teklif bulunamadı
            </div>
            <p className="text-xs text-slate-400">
              Arama kriterlerinizi değiştirmeyi veya yeni bir teklif oluşturmayı deneyin.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4 font-semibold">Teklif No</th>
                  <th className="p-4 font-semibold">Müşteri</th>
                  <th className="p-4 font-semibold">Tarih / Geçerlilik</th>
                  <th className="p-4 font-semibold">Kalem</th>
                  <th className="p-4 font-semibold">Toplam Tutar</th>
                  <th className="p-4 font-semibold">Durum</th>
                  <th className="p-4 font-semibold">PDF</th>
                  <th className="p-4 text-right font-semibold">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredQuotations.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() => setSelectedQuotationId(q.id)}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {q.quotationNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(q.createdAt).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                      {q.customerName}
                    </td>
                    <td className="p-4">
                      <div className="text-slate-700 dark:text-slate-300">
                        {new Date(q.quotationDate).toLocaleDateString("tr-TR")}
                      </div>
                      {q.validUntil && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                          Son: {new Date(q.validUntil).toLocaleDateString("tr-TR")}
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-slate-600 dark:text-slate-400">
                      {q.itemCount} kalem
                    </td>
                    <td className="p-4 font-bold text-blue-600 dark:text-blue-400">
                      {q.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                    </td>
                    <td className="p-4">
                      <StatusBadge
                        type="quotation"
                        status={q.status}
                        size="sm"
                      />
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      {q.quotationPdfUrl ? (
                        <a
                          href={q.quotationPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" /> PDF
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick state triggers */}
                        {q.status === QuotationStatus.Draft && (
                          <button
                            onClick={(e) => handleQuickAction(e, q.id, "send-for-approval")}
                            title="Müşteri Onayına Gönder"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {q.status === QuotationStatus.Accepted && (
                          <button
                            onClick={(e) => handleQuickAction(e, q.id, "approve")}
                            title="Onayla & Sipariş Oluştur"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedQuotationId(q.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800"
                        >
                          Detay
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateQuotationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadData}
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
