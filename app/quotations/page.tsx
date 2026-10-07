"use client";

import React, { useState, useEffect, useMemo } from "react";
import { quotationService } from "@/lib/api";
import { QuotationListItem, QuotationStatus } from "@/types";
import { StatusBadge } from "@/components/UI/StatusBadge";
import { QuotationDetailModal } from "@/components/Quotations/QuotationDetailModal";
import { CreateQuotationModal } from "@/components/Quotations/CreateQuotationModal";
import { useNotification } from "@/components/UI/NotificationContext";
import { Plus, Search, RefreshCw } from "lucide-react";

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
    { value: QuotationStatus.Cancelled, label: "İptal" },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            Teklif Yönetimi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Müşteri teklifleri, onay takibi ve sipariş dönüşüm akışı
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
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

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg p-3 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Teklif No veya Müşteri Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Status Filter Tabs / Select */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white dark:bg-blue-600 font-semibold"
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
                  className={`px-2.5 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
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

      {/* Quotations List */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            <span>Teklifler yükleniyor...</span>
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Eşleşen teklif bulunamadı
            </div>
            <p className="text-xs text-slate-400">
              Arama kriterini değiştirebilir veya yeni teklif oluşturabilirsiniz.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Teklif No</th>
                    <th className="py-3 px-4 font-semibold">Müşteri</th>
                    <th className="py-3 px-4 font-semibold">Tarih</th>
                    <th className="py-3 px-4 font-semibold">Kalem</th>
                    <th className="py-3 px-4 font-semibold text-right">Tutar</th>
                    <th className="py-3 px-4 font-semibold">Durum</th>
                    <th className="py-3 px-4 font-semibold text-center">PDF</th>
                    <th className="py-3 px-4 font-semibold text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredQuotations.map((q) => (
                    <tr
                      key={q.id}
                      onClick={() => setSelectedQuotationId(q.id)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {q.quotationNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {q.customerName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {new Date(q.quotationDate).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {q.itemCount} kalem
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">
                        {q.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge type="quotation" status={q.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        {q.quotationPdfUrl ? (
                          <a
                            href={q.quotationPdfUrl}
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
                          {q.status === QuotationStatus.Draft && (
                            <button
                              onClick={(e) => handleQuickAction(e, q.id, "send-for-approval")}
                              className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-medium transition-colors"
                            >
                              Onaya Gönder
                            </button>
                          )}
                          {q.status === QuotationStatus.Accepted && (
                            <button
                              onClick={(e) => handleQuickAction(e, q.id, "approve")}
                              className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-medium transition-colors"
                            >
                              Siparişe Dönüştür
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedQuotationId(q.id)}
                            className="px-2 py-1 rounded text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredQuotations.map((q) => (
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
                  <div className="text-xs text-slate-700 dark:text-slate-200 mt-1 font-medium">
                    {q.customerName}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                    <span>{new Date(q.quotationDate).toLocaleDateString("tr-TR")}</span>
                    <span>{q.itemCount} kalem</span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      {q.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                    </span>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {q.quotationPdfUrl && (
                        <a
                          href={q.quotationPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded text-xs font-medium text-blue-600 border border-blue-200 dark:border-blue-800"
                        >
                          PDF
                        </a>
                      )}
                      {q.status === QuotationStatus.Draft && (
                        <button
                          onClick={(e) => handleQuickAction(e, q.id, "send-for-approval")}
                          className="px-2 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-medium"
                        >
                          Onaya Gönder
                        </button>
                      )}
                      {q.status === QuotationStatus.Accepted && (
                        <button
                          onClick={(e) => handleQuickAction(e, q.id, "approve")}
                          className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-medium"
                        >
                          Siparişe Dönüştür
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedQuotationId(q.id)}
                        className="px-2 py-1 rounded text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
                      >
                        Detay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
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
