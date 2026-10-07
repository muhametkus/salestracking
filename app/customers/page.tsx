"use client";

import React, { useState, useEffect, useMemo } from "react";
import { customerService } from "@/lib/api";
import { CustomerListItem, Customer } from "@/types";
import { CustomerModal } from "@/components/Customers/CustomerModal";
import { useNotification } from "@/components/UI/NotificationContext";
import { Plus, Search, RefreshCw, Edit2, Trash2 } from "lucide-react";

export default function CustomersPage() {
  const { success, error } = useNotification();
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (err: any) {
      error(err.message || "Müşteriler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((item) => {
      const q = searchQuery.toLowerCase();
      const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
      const company = (item.companyName || "").toLowerCase();
      const phone = item.phone.toLowerCase();
      const email = (item.email || "").toLowerCase();

      return (
        fullName.includes(q) ||
        company.includes(q) ||
        phone.includes(q) ||
        email.includes(q)
      );
    });
  }, [customers, searchQuery]);

  const handleEdit = async (cItem: CustomerListItem) => {
    try {
      const fullCust = await customerService.getById(cItem.id);
      setEditingCustomer(fullCust);
      setIsModalOpen(true);
    } catch {
      setEditingCustomer({
        ...cItem,
        notes: null,
      });
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" müşterisini silmek istediğinize emin misiniz?`)) {
      return;
    }
    try {
      await customerService.delete(id);
      success("Müşteri silindi.");
      loadData();
    } catch (err: any) {
      error(err.message || "Müşteri silinemedi.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            Müşteri Rehberi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Teklif ve satış süreçlerinde kullanılan müşteri ve firma kayıtları
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingCustomer(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Müşteri</span>
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

      {/* Search Input */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg p-3 sm:p-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Müşteri Adı, Firma, Telefon veya E-posta Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            <span>Müşteriler yükleniyor...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Müşteri kaydı bulunamadı
            </div>
            <p className="text-xs text-slate-400">
              Yeni bir müşteri ekleyerek teklif oluşturmaya başlayabilirsiniz.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Müşteri</th>
                    <th className="py-3 px-4 font-semibold">Firma</th>
                    <th className="py-3 px-4 font-semibold">Telefon</th>
                    <th className="py-3 px-4 font-semibold">E-Posta</th>
                    <th className="py-3 px-4 font-semibold">Kayıt Tarihi</th>
                    <th className="py-3 px-4 font-semibold text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCustomers.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {c.firstName} {c.lastName}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {c.companyName || <span className="text-slate-400">Bireysel</span>}
                        {c.address && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                            {c.address}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {c.phone}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {c.email || <span className="text-slate-400">-</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Düzenle"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, `${c.firstName} ${c.lastName}`)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
              {filteredCustomers.map((c) => (
                <div key={c.id} className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">
                        {c.firstName} {c.lastName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {c.companyName || "Bireysel Müşteri"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(c)}
                        className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, `${c.firstName} ${c.lastName}`)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                    <a
                      href={`tel:${c.phone}`}
                      className="font-medium text-blue-600 dark:text-blue-400"
                    >
                      {c.phone}
                    </a>
                    {c.email && (
                      <span className="text-slate-500 truncate max-w-[180px]">
                        {c.email}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Customer Modal */}
      <CustomerModal
        customer={editingCustomer}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        onSuccess={loadData}
      />
    </div>
  );
}
