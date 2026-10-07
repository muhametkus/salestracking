"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  CheckSquare,
  Package,
  Layers,
  Users,
  Image as ImageIcon,
  Settings,
  X,
} from "lucide-react";

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

interface SidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose, isMobile }) => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-2.5 min-w-0"
        >
          <div className="w-8 h-8 rounded bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center font-bold text-xs tracking-wider shrink-0">
            ST
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Satış Takip
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              Kurumsal Panel
            </div>
          </div>
        </Link>

        {isMobile && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        <div className="px-3 pb-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Menü
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
