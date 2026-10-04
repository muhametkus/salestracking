"use client";

import React, { useState, useEffect, useMemo } from "react";
import { customerService } from "@/lib/api";
import { CustomerListItem, Customer } from "@/types";
import { CustomerModal } from "@/components/Customers/CustomerModal";
import { useNotification } from "@/components/UI/NotificationContext";
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Building,
  Calendar,
} from "lucide-react";

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
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Müşteri Rehberi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Teklif ve satış süreçlerinde kullanılan müşteri ve firma kayıtları.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Yenile"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setEditingCustomer(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Müşteri Ekle</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Müşteri Adı, Firma, Telefon veya E-posta Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
            <span>Müşteriler yükleniyor...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Müşteri kaydı bulunamadı
            </div>
            <p className="text-xs text-slate-400">
              Yeni bir müşteri ekleyerek teklif oluşturmaya başlayabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4 font-semibold">Müşteri</th>
                  <th className="p-4 font-semibold">Firma</th>
                  <th className="p-4 font-semibold">Telefon</th>
                  <th className="p-4 font-semibold">E-Posta</th>
                  <th className="p-4 font-semibold">Kayıt Tarihi</th>
                  <th className="p-4 text-right font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {c.firstName} {c.lastName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        #{c.id.substring(0, 8)}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                      {c.companyName ? (
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.companyName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Bireysel</span>
                      )}
                      {c.address && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs mt-0.5">
                          📍 {c.address}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{c.phone}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {c.email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(c.createdAt).toLocaleDateString("tr-TR")}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, `${c.firstName} ${c.lastName}`)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
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
