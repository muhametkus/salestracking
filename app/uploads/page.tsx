"use client";

import React, { useState, useEffect } from "react";
import { uploadService } from "@/lib/api";
import { UploadedImage } from "@/types";
import { useNotification } from "@/components/UI/NotificationContext";
import {
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Folder,
  Copy,
  ExternalLink,
  Check,
  Loader2,
  HardDrive,
} from "lucide-react";

export default function UploadsPage() {
  const { success, error } = useNotification();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState("products");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const loadData = async (folder?: string) => {
    try {
      setLoading(true);
      const targetFolder = folder === "all" ? undefined : folder;
      const [imgData, fldData] = await Promise.all([
        uploadService.getImages(targetFolder),
        uploadService.getFolders(),
      ]);
      setImages(imgData);
      setFolders(fldData);
    } catch (err: any) {
      error(err.message || "Görseller yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedFolder);
  }, [selectedFolder]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await uploadService.uploadImage(file, uploadFolder.trim() || undefined);
      success("Görsel başarıyla sunucuya yüklendi.");
      loadData(selectedFolder);
    } catch (err: any) {
      error(err.message || "Görsel yüklenemedi.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    success("Görsel linki panoya kopyalandı!");
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            Medya & Görsel Deposu
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ürün katalogları ve teklifler için backend sunucusuna yüklenen görseller.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(selectedFolder)}
            title="Yenile"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Upload Box & Folders Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Upload className="w-4 h-4 text-indigo-600" />
            Yeni Görsel Yükle
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hedef Klasör Adı
            </label>
            <input
              type="text"
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              placeholder="Örn: products, kapilar, mobilya"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Klasör otomatik olarak sunucuda oluşturulacaktır.
            </p>
          </div>

          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all cursor-pointer text-center group">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            ) : (
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            )}
            <div className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
              {uploading ? "Sunucuya Yükleniyor..." : "Dosya Seç veya Buraya Bırak"}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              JPG, PNG, WEBP, GIF, SVG
            </div>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Folders Filter Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Folder className="w-4 h-4 text-indigo-600" />
              Klasör Filtresi
            </div>
            <span className="text-xs text-slate-400">
              {images.length} dosya listeleniyor
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFolder("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                selectedFolder === "all"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Tüm Klasörler</span>
            </button>
            {folders.map((fld) => (
              <button
                key={fld}
                onClick={() => setSelectedFolder(fld)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  selectedFolder === fld
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>{fld}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Image Gallery Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
            <span>Görseller yükleniyor...</span>
          </div>
        ) : images.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Bu klasörde henüz görsel bulunmuyor
            </div>
            <p className="text-xs text-slate-400">
              Yukarıdaki alandan yeni bir ürün veya belge görseli yükleyebilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img, i) => (
              <div
                key={img.url || i}
                className="group border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/40 hover:shadow-md transition-all flex flex-col"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img
                    src={img.url}
                    alt={img.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopyUrl(img.url)}
                      title="Linki Kopyala"
                      className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white shadow transition-transform active:scale-90"
                    >
                      {copiedUrl === img.url ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noreferrer"
                      title="Yeni Sekmede Aç"
                      className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white shadow transition-transform active:scale-90"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <div className="font-mono text-[10px] text-slate-700 dark:text-slate-300 truncate" title={img.fileName}>
                    {img.fileName}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="capitalize">{img.folder}</span>
                    <span>{formatFileSize(img.sizeInBytes)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
