"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      // Set a dummy cookie for middleware
      document.cookie = "auth_token=true; path=/; max-age=86400";
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="absolute inset-0 bg-white/20 backdrop-blur-3xl"></div>
      
      <div className="relative z-10 max-w-md w-full p-10 bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg mb-4 text-white">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            LegalProp Portal
          </h2>
          <p className="text-gray-600 mt-2 font-medium">Secure Property Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 bg-white/50 border border-white/30 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-900 font-medium placeholder-gray-500"
                required
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 bg-white/50 border border-white/30 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-900 font-medium placeholder-gray-500"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_4px_14px_0_rgb(168,85,247,0.39)] text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all hover:scale-[1.02]"
          >
            Sign In to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
