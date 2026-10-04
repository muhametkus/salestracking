"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Package,
  Layers,
  Users,
  Image as ImageIcon,
  CheckSquare,
  Activity,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

const navigation = [
  { name: "Genel Bakış", href: "/", icon: LayoutDashboard },
  { name: "Teklifler", href: "/quotations", icon: FileSpreadsheet },
  { name: "Siparişler", href: "/orders", icon: CheckSquare },
  { name: "Ürünler", href: "/products", icon: Package },
  { name: "Kategoriler", href: "/categories", icon: Layers },
  { name: "Müşteriler", href: "/customers", icon: Users },
  { name: "Medya Deposu", href: "/uploads", icon: ImageIcon },
  { name: "Ayarlar", href: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");

  // Do not render sidebar on public pages
  if (pathname.startsWith("/onay/") || pathname.startsWith("/siparis-takip/")) {
    return null;
  }

  const checkHealth = async () => {
    setApiStatus("checking");
    try {
      const res = await fetch(`${API_BASE_URL}/api/Enums`, { method: "GET", cache: "no-store" });
      if (res.ok) {
        setApiStatus("online");
      } else {
        setApiStatus("offline");
      }
    } catch {
      setApiStatus("offline");
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-64 bg-white dark:bg-[#0c1322] border-r border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 flex flex-col h-screen sticky top-0 select-none shrink-0 z-30 transition-colors">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="overflow-hidden">
          <div className="font-bold text-slate-900 dark:text-white text-sm tracking-tight truncate">
            Satış Takip Sistemi
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Kurumsal Yönetim
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          Menü
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Backend API Health Status Indicator */}
      <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 m-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            API Bağlantısı
          </span>
          <button
            onClick={checkHealth}
            title="Yeniden Kontrol Et"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
          >
            <RefreshCw className={`w-3 h-3 ${apiStatus === "checking" ? "animate-spin text-blue-500" : ""}`} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {apiStatus === "online" && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                apiStatus === "online"
                  ? "bg-emerald-500"
                  : apiStatus === "checking"
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
            ></span>
          </span>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {apiStatus === "online"
              ? "Sunucu Aktif"
              : apiStatus === "checking"
              ? "Kontrol Ediliyor..."
              : "Bağlantı Yok"}
          </span>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-mono">:5010</span>
          <a
            href={`${API_BASE_URL}/swagger`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-600 flex items-center gap-1 transition-colors font-medium"
          >
            <span>Swagger</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </aside>
  );
};
