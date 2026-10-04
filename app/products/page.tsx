"use client";

import React, { useState, useEffect, useMemo } from "react";
import { productService, categoryService } from "@/lib/api";
import { ProductListItem, ProductCategory, Product } from "@/types";
import { ProductModal } from "@/components/Products/ProductModal";
import { useNotification } from "@/components/UI/NotificationContext";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Hammer,
  Truck,
  Wrench,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
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
      // Fallback to basic object if getById fails
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
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            Ürün Kataloğu
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Satışa sunulan ürünlerin fiyat, stok ve operasyonel gereksinim listesi.
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
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Ürün Ekle</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ürün Adı veya Kategori Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="w-full md:w-64">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
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

      {/* Products Grid / Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
            <span>Ürünler yükleniyor...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Ürün bulunamadı
            </div>
            <p className="text-xs text-slate-400">
              Yeni bir ürün ekleyerek kataloğunuzu oluşturun.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4 font-semibold w-16">Görsel</th>
                  <th className="p-4 font-semibold">Ürün Adı</th>
                  <th className="p-4 font-semibold">Kategori</th>
                  <th className="p-4 font-semibold">Gereksinimler</th>
                  <th className="p-4 font-semibold">Stok</th>
                  <th className="p-4 font-semibold">Fiyat</th>
                  <th className="p-4 font-semibold">Durum</th>
                  <th className="p-4 text-right font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-4">
                      {p.imageUrl ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        #{p.id.substring(0, 8)}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-600 dark:text-slate-300">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px]">
                        {p.productCategoryName || "Kategorisiz"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {p.requiresProduction && (
                          <span
                            title="Üretim Gerektirir"
                            className="p-1 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          >
                            <Hammer className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {p.requiresDelivery && (
                          <span
                            title="Teslimat Dahil"
                            className="p-1 rounded bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {p.requiresInstallation && (
                          <span
                            title="Montaj Dahil"
                            className="p-1 rounded bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {!p.requiresProduction &&
                          !p.requiresDelivery &&
                          !p.requiresInstallation && (
                            <span className="text-slate-400">-</span>
                          )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] ${
                          p.stock > 10
                            ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : p.stock > 0
                            ? "text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400"
                            : "text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400"
                        }`}
                      >
                        {p.stock} Adet
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {p.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                    </td>
                    <td className="p-4">
                      {p.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                          <XCircle className="w-3.5 h-3.5" /> Pasif
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
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
