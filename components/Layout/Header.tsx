"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  Sun,
  Moon,
  Plus,
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
    subtitle: "Sipariş iş akış durumları, bildirim şablonları ve ayarlar",
  },
};

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // Hide header on public customer approval and tracking pages
  if (
    pathname.startsWith("/onay/") ||
    pathname.startsWith("/onayla/") ||
    pathname.startsWith("/siparis-takip/")
  ) {
    return null;
  }

  const current = titleMap[pathname] || {
    title: "Satış Takip Sistemi",
    subtitle: "Kurumsal Satış ve Teklif Yönetim Sistemi",
  };

  return (
    <header className="h-16 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Menu Hamburger Button */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 -ml-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Menüyü Aç"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">
            {current.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 truncate">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick create action */}
        {pathname !== "/quotations" && (
          <Link
            href="/quotations"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Yeni Teklif</span>
          </Link>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Açık Moda Geç" : "Koyu Moda Geç"}
          className="p-2 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Tema Değiştir"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* User Pill */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center font-semibold text-[11px]">
            MK
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-medium text-slate-800 dark:text-slate-200 leading-tight">
              Muhammet K.
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
