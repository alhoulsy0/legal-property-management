"use client";

import Link from "next/link";
import { Scale, LogOut, LayoutDashboard, Users, FileText, Calendar, DollarSign } from "lucide-react";
import { GlobalProvider } from "./GlobalProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <GlobalProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row rtl">
        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-slate-900 text-slate-300 flex flex-col">
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <Scale className="w-8 h-8 text-blue-500" />
            <h1 className="text-xl font-extrabold text-white tracking-tight">مكتب المحاماة للأملاك</h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all font-bold group">
              <LayoutDashboard className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              لوحة القيادة
            </Link>
            <Link href="/clients" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all font-bold group">
              <Users className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              إدارة الأملاك والعقارات
            </Link>
            <Link href="/cases" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all font-bold group">
              <Scale className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              سجل القضايا
            </Link>
            <Link href="/cases?tab=agenda" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all font-bold group">
              <Calendar className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              أجندة الجلسات
            </Link>
            <Link href="/cases?tab=financials" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all font-bold group">
              <DollarSign className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              المالية
            </Link>
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={() => {
                document.cookie = "auth_token=; max-age=0; path=/";
                window.location.href = "/login";
              }} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-950/30 hover:text-rose-400 transition-all font-bold text-slate-400 group text-right cursor-pointer"
            >
              <LogOut className="w-5 h-5 group-hover:text-rose-500 transition-colors" />
              تسجيل الخروج
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </GlobalProvider>
  );
}
