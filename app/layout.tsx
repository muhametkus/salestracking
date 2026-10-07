import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppLayout } from "@/components/Layout/AppLayout";
import { NotificationProvider } from "@/components/UI/NotificationContext";
import { ThemeProvider } from "@/components/UI/ThemeContext";

export const metadata: Metadata = {
  title: "Satış Takip Sistemi - Kurumsal Satış & Teklif Yönetimi",
  description: "Modern Kurumsal Satış, Teklif ve Sipariş Takip Paneli",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-100 dark:selection:bg-blue-900/50">
        <ThemeProvider>
          <NotificationProvider>
            <AppLayout>{children}</AppLayout>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
