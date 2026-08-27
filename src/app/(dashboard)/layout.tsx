"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, Briefcase, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-blue-200">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-10 max-w-[1400px] mx-auto w-full">
          <Link href="/" className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="font-extrabold text-xl text-slate-900 tracking-tight">
              LegalProp
            </div>
          </Link>
          
          <div className="flex space-x-2">
            <Link 
              href="/cases" 
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all text-sm font-semibold ${
                pathname === '/cases' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Cases</span>
            </Link>
            <Link 
              href="/dashboard" 
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all text-sm font-semibold ${
                (pathname === '/dashboard' || pathname.startsWith('/clients')) ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Property Management</span>
            </Link>
          </div>
          
          <div className="flex-1 flex justify-end">
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </nav>
      
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-6 md:p-8 relative">
        {children}
      </main>
    </div>
  );
}
