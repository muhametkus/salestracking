"use client";

import React, { useState, useEffect } from "react";
import { uploadService } from "@/lib/api";
import { UploadedImage } from "@/types";
import { useNotification } from "@/components/UI/NotificationContext";
import {
  Upload,
  RefreshCw,
  Copy,
  ExternalLink,
  Check,
  Loader2,
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
    <div className="space-y-5">
      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            Medya Deposu
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ürün katalogları ve teklifler için backend sunucusuna yüklenen görseller
          </p>
        </div>

        <button
          onClick={() => loadData(selectedFolder)}
          title="Yenile"
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-500" : ""}`} />
          <span>Yenile</span>
        </button>
      </div>

      {/* Upload Box & Folders Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upload Card */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
          <div className="text-xs font-semibold text-slate-900 dark:text-white">
            Yeni Görsel Yükle
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
              Hedef Klasör
            </label>
            <input
              type="text"
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              placeholder="Örn: products, kapilar, mobilya"
              className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <label className="flex flex-col items-center justify-center p-5 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-colors cursor-pointer text-center">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            ) : (
              <Upload className="w-6 h-6 text-slate-400" />
            )}
            <div className="mt-2 text-xs font-medium text-slate-800 dark:text-slate-200">
              {uploading ? "Sunucuya Yükleniyor..." : "Görsel Seç veya Sürükle"}
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
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-900 dark:text-white">
              Klasör Filtresi
            </div>
            <span className="text-[11px] text-slate-400">
              {images.length} dosya
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedFolder("all")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                selectedFolder === "all"
                  ? "bg-slate-900 text-white dark:bg-blue-600 font-semibold"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Tüm Klasörler
            </button>
            {folders.map((fld) => (
              <button
                key={fld}
                onClick={() => setSelectedFolder(fld)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  selectedFolder === fld
                    ? "bg-blue-600 text-white font-semibold"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {fld}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Image Gallery Grid */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg p-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            <span>Görseller yükleniyor...</span>
          </div>
        ) : images.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Bu klasörde henüz görsel bulunmuyor
            </div>
            <p className="text-xs text-slate-400">
              Sol taraftaki yükleme alanından yeni görsel ekleyebilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((img, i) => (
              <div
                key={img.url || i}
                className="group border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img
                    src={img.url}
                    alt={img.fileName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopyUrl(img.url)}
                      title="Linki Kopyala"
                      className="p-1.5 rounded bg-white text-slate-800 hover:bg-slate-100 shadow transition-transform"
                    >
                      {copiedUrl === img.url ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noreferrer"
                      title="Yeni Sekmede Aç"
                      className="p-1.5 rounded bg-white text-slate-800 hover:bg-slate-100 shadow transition-transform"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="p-2 flex-1 flex flex-col justify-between">
                  <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate" title={img.fileName}>
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
