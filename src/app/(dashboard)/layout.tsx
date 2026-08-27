"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, Briefcase, LogOut, Hexagon } from "lucide-react";

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
    <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-purple-200">
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-10 max-w-7xl mx-auto w-full">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md text-white">
              <Hexagon className="w-6 h-6" />
            </div>
            <div className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
              LegalProp
            </div>
          </div>
          
          <div className="flex space-x-1">
            <Link 
              href="/cases" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all font-medium ${
                pathname === '/cases' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span>Cases</span>
            </Link>
            <Link 
              href="/" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all font-medium ${
                (pathname === '/' || pathname.startsWith('/clients')) ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span>Property Management</span>
            </Link>
          </div>
          
          <div className="flex-1 flex justify-end">
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </nav>
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-300/20 blur-3xl -z-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-300/20 blur-3xl -z-10"></div>
        {children}
      </main>
    </div>
  );
}
