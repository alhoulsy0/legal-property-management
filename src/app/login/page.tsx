"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      document.cookie = "auth_token=true; path=/; max-age=86400";
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Modern minimal background */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-100/50 rounded-bl-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-indigo-100/50 rounded-tr-full blur-3xl -z-10"></div>
      
      <div className="relative z-20 max-w-md w-full p-8 sm:p-10 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Link>
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm mb-5 text-white">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign in to LegalProp
          </h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">Enter your details to access the portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-slate-900 font-medium placeholder-slate-400 sm:text-sm"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-slate-900 font-medium placeholder-slate-400 sm:text-sm"
                  required
                />
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors shadow-sm"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
