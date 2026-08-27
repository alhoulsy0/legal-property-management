import Link from "next/link";
import { ShieldCheck, TrendingUp, Building2, ChevronRight, LayoutDashboard } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-200">
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-sm text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              LegalProp
            </span>
          </div>
          <div className="flex space-x-4">
            <Link 
              href="/login" 
              className="text-slate-600 font-semibold px-5 py-2 rounded-xl hover:bg-slate-100 transition-colors flex items-center"
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="bg-slate-900 text-white font-semibold px-5 py-2 rounded-xl shadow-sm hover:bg-slate-800 transition-all hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative pt-32 pb-20 overflow-hidden">
        {/* Subtle modern background blur */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[120px] -z-10"></div>

        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center text-center mt-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>The modern standard for property management</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Manage assets with <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">absolute clarity.</span>
          </h1>
          
          <p className="mt-6 text-xl text-slate-500 max-w-2xl font-medium leading-relaxed">
            A premium legal and property management platform to streamline contracts, track expenses, and oversee litigation workflows—all in one place.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              href="/login" 
              className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:bg-blue-700 hover:shadow-[0_0_25px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              <span>Access Dashboard</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-32 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mb-6 w-max">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Portfolio Tracking</h3>
            <p className="text-slate-500 font-medium leading-relaxed">Keep tabs on all properties, units, and contracts across your entire client base in real time.</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-6 w-max">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Financial Clarity</h3>
            <p className="text-slate-500 font-medium leading-relaxed">Monitor expected vs. collected revenue, track expenses, and optimize your net cash flow instantly.</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="p-3 bg-slate-100 text-slate-700 rounded-xl mb-6 w-max">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Legal & Compliance</h3>
            <p className="text-slate-500 font-medium leading-relaxed">Receive automated alerts for delayed payments and seamlessly escalate contracts to litigation.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
