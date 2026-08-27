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
    <div className="flex flex-col min-h-screen bg-gray-50 selection:bg-red-200">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-10 max-w-7xl mx-auto w-full">
          <Link href="/" className="flex items-center space-x-2">
            <div className="p-2 bg-red-600 rounded-lg shadow-md shadow-red-600/20 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="font-extrabold text-xl text-black tracking-tight">
              LegalProp <span className="text-red-600">Jordan</span>
            </div>
          </Link>
          
          <div className="flex space-x-1">
            <Link 
              href="/cases" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all font-medium ${
                pathname === '/cases' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Cases</span>
            </Link>
            <Link 
              href="/dashboard" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all font-medium ${
                (pathname === '/dashboard' || pathname.startsWith('/clients')) ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Property Management</span>
            </Link>
          </div>
          
          <div className="flex-1 flex justify-end">
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors px-4 py-2 rounded-xl hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </nav>
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/5 blur-[120px] -z-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-green-600/5 blur-[120px] -z-10"></div>
        {children}
      </main>
    </div>
  );
}
