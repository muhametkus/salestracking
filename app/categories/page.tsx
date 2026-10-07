"use client";

import React, { useState, useEffect, useMemo } from "react";
import { categoryService } from "@/lib/api";
import { ProductCategory } from "@/types";
import { CategoryModal } from "@/components/Categories/CategoryModal";
import { useNotification } from "@/components/UI/NotificationContext";
import { Plus, Search, RefreshCw, Edit2, Trash2 } from "lucide-react";

export default function CategoriesPage() {
  const { success, error } = useNotification();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err: any) {
      error(err.message || "Kategoriler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [categories, searchQuery]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" adlı kategoriyi silmek istediğinize emin misiniz?`)) {
      return;
    }
    try {
      await categoryService.delete(id);
      success("Kategori silindi.");
      loadData();
    } catch (err: any) {
      error(err.message || "Kategori silinemedi.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            Ürün Kategorileri
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ürün kataloğunu sınıflandırmak için kategori yönetimi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Kategori</span>
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
            placeholder="Kategori Adı veya Açıklama Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
          <span>Kategoriler yükleniyor...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-16 text-center space-y-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Kategori bulunamadı
          </div>
          <p className="text-xs text-slate-400">
            Yeni bir kategori ekleyerek ürünlerinizi gruplandırabilirsiniz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredCategories.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {c.name}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingCategory(c);
                        setIsModalOpen(true);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {c.description || "Açıklama belirtilmemiş."}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                #{c.id.substring(0, 8)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CategoryModal
        category={editingCategory}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={loadData}
      />
    </div>
  );
}
