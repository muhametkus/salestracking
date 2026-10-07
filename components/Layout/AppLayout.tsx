"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import Link from "next/link";
import {
  LayoutDashboard,
  FileSpreadsheet,
  CheckSquare,
  Users,
  Menu,
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Do not render layout shell on public customer pages
  const isPublicPage =
    pathname.startsWith("/onay/") ||
    pathname.startsWith("/onayla/") ||
    pathname.startsWith("/siparis-takip/");

  if (isPublicPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  const mobileNavItems = [
    { name: "Özet", href: "/", icon: LayoutDashboard },
    { name: "Teklifler", href: "/quotations", icon: FileSpreadsheet },
    { name: "Siparişler", href: "/orders", icon: CheckSquare },
    { name: "Müşteriler", href: "/customers", icon: Users },
  ];

  return (
    <div className="min-h-screen flex w-full bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-60 lg:shrink-0 lg:border-r lg:border-slate-200 lg:dark:border-slate-800 lg:bg-white lg:dark:bg-[#111827] sticky top-0 h-screen z-30">
        <Sidebar onClose={() => {}} />
      </div>

      {/* Mobile Drawer (Backdrop + Sidebar) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Menüyü Kapat"
          />
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-[#111827] h-full shadow-2xl flex flex-col z-10 border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-200">
            <Sidebar onClose={() => setMobileMenuOpen(false)} isMobile />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (Easy thumb navigation on phones) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111827]/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-md text-[10px] font-medium transition-colors ${
                  isActive
                    ? "text-blue-700 dark:text-blue-400 font-semibold"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-md text-[10px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <Menu className="w-4 h-4 mb-0.5" />
            <span>Menü</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
