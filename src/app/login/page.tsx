"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Building2 } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
      {/* Abstract Jordanian flag inspired background */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-black"></div>
      <div className="absolute top-1/3 left-0 w-full h-1/3 bg-white"></div>
      <div className="absolute top-2/3 left-0 w-full h-1/3 bg-green-700"></div>
      <div className="absolute top-0 left-0 w-0 h-0 border-t-[50vh] border-t-transparent border-l-[40vw] border-l-red-600 border-b-[50vh] border-b-transparent z-0"></div>
      
      <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl z-10"></div>
      
      <div className="relative z-20 max-w-md w-full p-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50">
        <Link href="/" className="absolute top-6 left-6 text-gray-500 hover:text-black font-medium transition-colors">
          ← Back
        </Link>
        <div className="text-center mb-10 mt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600 shadow-lg shadow-red-600/40 mb-4 text-white">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-black tracking-tight">
            Welcome Back
          </h2>
          <p className="text-gray-600 mt-2 font-medium">Sign in to your portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all text-black font-medium placeholder-gray-400"
                required
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all text-black font-medium placeholder-gray-400"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-black/20 text-sm font-bold text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all hover:scale-[1.02]"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
