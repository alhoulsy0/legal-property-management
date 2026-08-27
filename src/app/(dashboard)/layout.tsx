import Link from "next/link";
import { Scale, LogOut, LayoutDashboard, Users, FileText } from "lucide-react";
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
              اللوحة الرئيسية
            </Link>
            <Link href="/clients" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all font-bold group">
              <Users className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              الموكلين (الملاك)
            </Link>
            <Link href="/cases" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all font-bold group">
              <FileText className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              القضايا والنزاعات
            </Link>
          </nav>

          <div className="p-4 border-t border-slate-800">
            <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-950/30 hover:text-rose-400 transition-all font-bold text-slate-400 group">
              <LogOut className="w-5 h-5 group-hover:text-rose-500 transition-colors" />
              تسجيل الخروج
            </Link>
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
