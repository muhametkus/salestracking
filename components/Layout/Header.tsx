"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  FilePlus,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/UI/ThemeContext";

const titleMap: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Yönetim Paneli",
    subtitle: "Satış, teklif ve sipariş süreçlerinin operasyonel özeti",
  },
  "/quotations": {
    title: "Teklif Yönetimi",
    subtitle: "Müşteri teklifleri, onay takibi ve sipariş dönüşüm akışı",
  },
  "/orders": {
    title: "Sipariş Takibi",
    subtitle: "Onaylanan siparişlerin teslimat ve operasyonel süreçleri",
  },
  "/products": {
    title: "Ürün Kataloğu",
    subtitle: "Fiyat, stok ve operasyonel gereksinim tanımlı ürünler",
  },
  "/categories": {
    title: "Ürün Kategorileri",
    subtitle: "Kategori tanımları ve ürün gruplandırmaları",
  },
  "/customers": {
    title: "Müşteri Rehberi",
    subtitle: "Müşteri kartları, adres ve iletişim bilgileri",
  },
  "/uploads": {
    title: "Medya & Görsel Deposu",
    subtitle: "Sunucudaki ürün ve belge görselleri",
  },
  "/settings": {
    title: "Sistem ve Süreç Ayarları",
    subtitle: "Sipariş iş akış durumları, bildirim şablonları ve operasyonel ayarlar",
  },
};

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // Hide header on public customer approval and tracking pages
  if (pathname.startsWith("/onay/") || pathname.startsWith("/siparis-takip/")) {
    return null;
  }

  const current = titleMap[pathname] || {
    title: "Satış Takip Sistemi",
    subtitle: "Kurumsal Satış ve Teklif Yönetim Sistemi",
  };

  return (
    <header className="h-18 bg-white/90 dark:bg-[#0c1322]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-20 transition-colors">
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          {current.title}
        </h1>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {current.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Açık Moda Geç" : "Koyu Moda Geç"}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Quick create action */}
        {pathname !== "/quotations" && (
          <Link
            href="/quotations"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Yeni Teklif</span>
          </Link>
        )}

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
            MK
          </div>
          <div className="hidden sm:block text-left text-xs">
            <div className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">Muhammet Kuş</div>
            <div className="text-[10px] text-slate-400">Yönetici</div>
          </div>
        </div>
      </div>
    </header>
  );
};
