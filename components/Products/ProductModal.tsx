"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/UI/Modal";
import { productService, categoryService, uploadService } from "@/lib/api";
import { Product, ProductCategory } from "@/types";
import { useNotification } from "@/components/UI/NotificationContext";
import { Loader2, Upload, Image as ImageIcon, Check } from "lucide-react";

interface ProductModalProps {
  product: Product | null; // null for Create, object for Edit
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error } = useNotification();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [imageUrl, setImageUrl] = useState("");
  const [requiresProduction, setRequiresProduction] = useState(false);
  const [requiresDelivery, setRequiresDelivery] = useState(false);
  const [requiresInstallation, setRequiresInstallation] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isVatIncluded, setIsVatIncluded] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (product) {
        setName(product.name);
        setProductCategoryId(product.productCategoryId);
        setDescription(product.description || "");
        setPrice(product.price);
        setStock(product.stock);
        setImageUrl(product.imageUrl || "");
        setRequiresProduction(product.requiresProduction);
        setRequiresDelivery(product.requiresDelivery);
        setRequiresInstallation(product.requiresInstallation);
        setIsActive(product.isActive);
        setIsVatIncluded(product.isVatIncluded !== undefined ? product.isVatIncluded : true);
      } else {
        resetForm();
      }
    }
  }, [isOpen, product]);

  const resetForm = () => {
    setName("");
    setProductCategoryId("");
    setDescription("");
    setPrice("");
    setStock("");
    setImageUrl("");
    setRequiresProduction(false);
    setRequiresDelivery(false);
    setRequiresInstallation(false);
    setIsActive(true);
    setIsVatIncluded(true);
  };

  const loadCategories = async () => {
    try {
      setLoadingCats(true);
      const data = await categoryService.getAll();
      setCategories(data);
      if (data.length > 0 && !product && !productCategoryId) {
        setProductCategoryId(data[0].id);
      }
    } catch (err: any) {
      error("Kategoriler yüklenirken hata oluştu.");
    } finally {
      setLoadingCats(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await uploadService.uploadImage(file, "products");
      setImageUrl(res.url);
      success("Ürün görseli başarıyla yüklendi.");
    } catch (err: any) {
      error(err.message || "Görsel yüklenemedi.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error("Lütfen ürün adını girin.");
      return;
    }
    if (!productCategoryId) {
      error("Lütfen bir kategori seçin.");
      return;
    }

    try {
      setSubmitting(true);
      if (product) {
        // Update
        await productService.update(product.id, {
          id: product.id,
          productCategoryId,
          name: name.trim(),
          description: description.trim() || null,
          price: Number(price) || 0,
          stock: Number(stock) || 0,
          imageUrl: imageUrl.trim() || null,
          requiresProduction,
          requiresDelivery,
          requiresInstallation,
          isActive,
          isVatIncluded,
        });
        success("Ürün başarıyla güncellendi.");
      } else {
        // Create
        await productService.create({
          productCategoryId,
          name: name.trim(),
          description: description.trim() || null,
          price: Number(price) || 0,
          stock: Number(stock) || 0,
          imageUrl: imageUrl.trim() || null,
          requiresProduction,
          requiresDelivery,
          requiresInstallation,
          isVatIncluded,
        });
        success("Yeni ürün başarıyla eklendi.");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || "İşlem sırasında hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
      subtitle={product ? `#${product.id.substring(0, 8)}` : "Kataloğa yeni bir ürün tanımlayın"}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ürün Adı *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Laminat Parke A Kalite"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kategori *
            </label>
            <select
              required
              value={productCategoryId}
              onChange={(e) => setProductCategoryId(e.target.value)}
              disabled={loadingCats}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Kategori Seçin...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Birim Fiyat (₺) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
              placeholder="0.00"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Stok Miktarı *
            </label>
            <input
              type="number"
              min="0"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value === "" ? "" : parseInt(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* KDV Seçimi */}
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            KDV Durumu *
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                name="isVatIncluded"
                checked={isVatIncluded === true}
                onChange={() => setIsVatIncluded(true)}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Fiyata KDV Dahil
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                name="isVatIncluded"
                checked={isVatIncluded === false}
                onChange={() => setIsVatIncluded(false)}
                className="w-4 h-4 text-amber-600 focus:ring-amber-500"
              />
              <span className="font-medium text-amber-600 dark:text-amber-400">
                KDV Hariç
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Açıklama
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Ürün teknik özellikleri veya detayları..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Image Upload / URL */}
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Ürün Görseli
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {imageUrl ? (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 bg-white">
                <img
                  src={imageUrl}
                  alt="Önizleme"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <ImageIcon className="w-6 h-6" />
              </div>
            )}

            <div className="flex-1 w-full space-y-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Görsel URL veya dosya yükleyin..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <label className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                {uploadingImage ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-indigo-500" />
                )}
                <span>{uploadingImage ? "Yükleniyor..." : "Dosya Yükle (.png, .jpg)"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Requirements Checkboxes */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Operasyonel Rozetler
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={requiresProduction}
                onChange={(e) => setRequiresProduction(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Üretim Gerektirir</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={requiresDelivery}
                onChange={(e) => setRequiresDelivery(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Teslimat Dahil</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={requiresInstallation}
                onChange={(e) => setRequiresInstallation(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Montaj Dahil</span>
            </label>
          </div>
        </div>

        {product && (
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Ürün Satışta / Aktif</span>
            </label>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Vazgeç
          </button>
          <button
            type="submit"
            disabled={submitting || uploadingImage}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 rounded-xl shadow-sm transition-all"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {product ? "Değişiklikleri Kaydet" : "Ürünü Oluştur"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
