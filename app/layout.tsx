import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import { NotificationProvider } from "@/components/UI/NotificationContext";
import { ThemeProvider } from "@/components/UI/ThemeContext";

export const metadata: Metadata = {
  title: "Satış Takip Sistemi - Kurumsal Satış & Teklif Yönetimi",
  description: "Modern .NET Web API entegreli Satış, Teklif ve Sipariş Takip Paneli",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex antialiased">
        <ThemeProvider>
          <NotificationProvider>
            {/* Left Sidebar */}
            <Sidebar />

            {/* Right Main Content */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">
              <Header />
              <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">{children}</main>
            </div>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
