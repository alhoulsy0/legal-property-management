import Link from "next/link";
import { ShieldCheck, TrendingUp, Building2, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-red-200">
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg shadow-md text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-gray-900">
              LegalProp <span className="text-red-600">Jordan</span>
            </span>
          </div>
          <div className="flex space-x-4">
            <Link 
              href="/login" 
              className="text-gray-900 font-bold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-red-600/30 hover:bg-red-700 transition-all hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative pt-32 pb-20">
        <div className="absolute top-0 right-0 w-1/2 h-[600px] bg-gradient-to-bl from-green-50 to-transparent -z-10 blur-3xl rounded-full"></div>
        <div className="absolute top-20 left-0 w-1/2 h-[600px] bg-gradient-to-br from-red-50 to-transparent -z-10 blur-3xl rounded-full"></div>

        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center mt-10">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-black text-white text-sm font-bold mb-8">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Now available for real estate professionals in Amman</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight max-w-4xl leading-tight">
            Manage your properties with <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">absolute control.</span>
          </h1>
          
          <p className="mt-8 text-xl text-gray-600 max-w-2xl font-medium leading-relaxed">
            The premier legal and property management platform designed to streamline contracts, track expenses, and monitor litigation workflows—all in one beautiful dashboard.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              href="/login" 
              className="bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-black/20 hover:bg-gray-900 transition-all hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Access Dashboard</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-32 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Portfolio Tracking</h3>
            <p className="text-gray-600 font-medium">Keep tabs on all properties, units, and contracts across your entire client base in real time.</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
            <div className="p-4 bg-green-50 text-green-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Financial Clarity</h3>
            <p className="text-gray-600 font-medium">Monitor expected vs. collected revenue, track expenses, and optimize your net cash flow instantly.</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
            <div className="p-4 bg-black text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Legal & Compliance</h3>
            <p className="text-gray-600 font-medium">Receive automated alerts for delayed payments and seamlessly escalate contracts to litigation.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
