import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({ subsets: ["arabic"], weight: ["400", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "إدارة الأملاك - محاماة",
  description: "نظام إدارة أملاك وعقارات حديث للمحامين",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} antialiased bg-slate-50`}>
        {children}
      </body>
    </html>
  );
}
