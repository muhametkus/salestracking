"use client";

import React, { useState, useEffect, useMemo } from "react";
import { productService, categoryService } from "@/lib/api";
import { ProductListItem, ProductCategory, Product } from "@/types";
import { ProductModal } from "@/components/Products/ProductModal";
import { useNotification } from "@/components/UI/NotificationContext";
import {
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
} from "lucide-react";

export default function ProductsPage() {
  const { success, error } = useNotification();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pData, cData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll().catch(() => []),
      ]);
      setProducts(pData);
      setCategories(cData);
    } catch (err: any) {
      error(err.message || "Ürünler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.productCategoryName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || item.productCategoryId === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const handleEdit = async (pItem: ProductListItem) => {
    try {
      const fullProd = await productService.getById(pItem.id);
      setEditingProduct(fullProd);
      setIsModalOpen(true);
    } catch {
      setEditingProduct({
        ...pItem,
        description: null,
      });
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" adlı ürünü silmek istediğinize emin misiniz?`)) {
      return;
    }
    try {
      await productService.delete(id);
      success("Ürün başarıyla silindi.");
      loadData();
    } catch (err: any) {
      error(err.message || "Ürün silinemedi.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            Ürün Kataloğu
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Satışa sunulan ürünlerin fiyat, stok ve operasyonel gereksinim listesi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Ürün Ekle</span>
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
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ürün Adı veya Kategori Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="w-full md:w-60">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="all">Tüm Kategoriler ({products.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            <span>Ürünler yükleniyor...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Ürün bulunamadı
            </div>
            <p className="text-xs text-slate-400">
              Yeni bir ürün ekleyerek kataloğunuzu oluşturabilirsiniz.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold w-14">Görsel</th>
                    <th className="py-3 px-4 font-semibold">Ürün Adı</th>
                    <th className="py-3 px-4 font-semibold">Kategori</th>
                    <th className="py-3 px-4 font-semibold">Gereksinimler</th>
                    <th className="py-3 px-4 font-semibold">Stok</th>
                    <th className="py-3 px-4 font-semibold text-right">Fiyat</th>
                    <th className="py-3 px-4 font-semibold">Durum</th>
                    <th className="py-3 px-4 font-semibold text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-4">
                        {p.imageUrl ? (
                          <div className="w-10 h-10 rounded border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-medium">
                            Yok
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          #{p.id.substring(0, 8)}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                        {p.productCategoryName || "Kategorisiz"}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          {p.requiresProduction && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60">
                              Üretim
                            </span>
                          )}
                          {p.requiresDelivery && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60">
                              Teslimat
                            </span>
                          )}
                          {p.requiresInstallation && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-50 text-purple-800 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60">
                              Montaj
                            </span>
                          )}
                          {!p.requiresProduction && !p.requiresDelivery && !p.requiresInstallation && (
                            <span className="text-slate-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {p.stock} Adet
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold text-slate-900 dark:text-white">
                        {p.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              p.isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          <span className={p.isActive ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500"}>
                            {p.isActive ? "Aktif" : "Pasif"}
                          </span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Düzenle"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
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
              {filteredProducts.map((p) => (
                <div key={p.id} className="p-3.5 space-y-2.5">
                  <div className="flex items-start gap-3">
                    {p.imageUrl ? (
                      <div className="w-14 h-14 rounded border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 shrink-0">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-medium shrink-0">
                        Yok
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                          {p.name}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium ml-2 shrink-0">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          <span className={p.isActive ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"}>
                            {p.isActive ? "Aktif" : "Pasif"}
                          </span>
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {p.productCategoryName || "Kategorisiz"} &bull; {p.stock} Adet
                      </div>

                      <div className="font-semibold text-xs text-slate-900 dark:text-white mt-1">
                        {p.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                      </div>
                    </div>
                  </div>

                  {/* Requirements & Mobile Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                    <div className="flex items-center gap-1 flex-wrap">
                      {p.requiresProduction && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                          Üretim
                        </span>
                      )}
                      {p.requiresDelivery && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                          Teslimat
                        </span>
                      )}
                      {p.requiresInstallation && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
                          Montaj
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="px-2 py-1 rounded text-rose-600 hover:bg-rose-50 text-xs font-medium"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        product={editingProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={loadData}
      />
    </div>
  );
}
