"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/UI/Modal";
import { categoryService } from "@/lib/api";
import { ProductCategory } from "@/types";
import { useNotification } from "@/components/UI/NotificationContext";
import { Loader2 } from "lucide-react";

interface CategoryModalProps {
  category: ProductCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error } = useNotification();
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name);
        setDescription(category.description || "");
      } else {
        setName("");
        setDescription("");
      }
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error("Lütfen kategori adını girin.");
      return;
    }

    try {
      setSubmitting(true);
      if (category) {
        await categoryService.update(category.id, {
          id: category.id,
          name: name.trim(),
          description: description.trim() || null,
        });
        success("Kategori güncellendi.");
      } else {
        await categoryService.create({
          name: name.trim(),
          description: description.trim() || null,
        });
        success("Yeni kategori oluşturuldu.");
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
      title={category ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}
      subtitle={category ? `#${category.id.substring(0, 8)}` : "Ürün gruplandırması için kategori tanımlayın"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Kategori Adı *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn: Melamin Kapılar"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Açıklama
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Kategori kapsamı veya açıklayıcı not..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

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
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 rounded-xl shadow-sm transition-all"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {category ? "Güncelle" : "Kategoriyi Kaydet"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
