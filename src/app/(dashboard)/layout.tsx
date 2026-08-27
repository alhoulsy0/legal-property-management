import Link from "next/link";
import { Building2, Briefcase } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="font-bold text-xl text-blue-900">LegalProp</div>
          <div className="flex space-x-4">
            <Link href="/cases" className="text-gray-600 hover:text-blue-600 flex items-center space-x-2">
              <Briefcase className="w-5 h-5" />
              <span>Cases</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-blue-600 flex items-center space-x-2">
              <Building2 className="w-5 h-5" />
              <span>Property Management</span>
            </Link>
          </div>
        </div>
        <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">
          Logout
        </Link>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
