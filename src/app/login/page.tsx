"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scale, Lock, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    document.cookie = "auth_token=true; path=/";
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <Link href="/" className="absolute top-8 left-8 text-slate-500 hover:text-slate-900 flex items-center gap-2 font-bold transition-colors">
        <ArrowLeft className="w-5 h-5" /> العودة للرئيسية
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-slate-900 p-4 rounded-2xl shadow-xl">
            <Scale className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-slate-900 tracking-tight">
          بوابة الدخول للمحامين
        </h2>
        <p className="mt-2 text-center text-sm font-bold text-slate-500">
          أدخل بيانات الاعتماد للوصول لملفات الموكلين والعقارات
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-2xl sm:rounded-3xl sm:px-10 border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">اسم المستخدم</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="المحامي"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-slate-900 font-bold placeholder-slate-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-slate-900 font-bold placeholder-slate-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-black text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all"
              >
                تسجيل الدخول للنظام
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
