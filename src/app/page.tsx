import Link from "next/link";
import { Scale, Building, ShieldCheck, Clock, ArrowLeft } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-200">
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2.5 rounded-xl shadow-lg">
            <Scale className="w-6 h-6 text-blue-500" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">مكتب المحاماة للأملاك</span>
        </div>
        <Link 
          href="/login" 
          className="bg-white text-slate-900 font-bold px-6 py-2.5 rounded-full border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-sm flex items-center gap-2"
        >
          تسجيل الدخول للمحامين <ArrowLeft className="w-4 h-4" />
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/50 blur-3xl rounded-full -z-10"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 blur-3xl rounded-full -z-10"></div>

        <div className="max-w-4xl space-y-8 mt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold text-sm mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            النظام المعتمد لإدارة العقارات قانونياً
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
            إدارة أملاك موكليك <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              بأمان واحترافية تامة
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-semibold leading-relaxed">
            نظام متكامل للمحامين لإدارة عقود الإيجار، تحصيل الإيجارات، رفع القضايا، وحفظ حقوق الملاك بكل دقة وشفافية.
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/login" 
              className="w-full sm:w-auto bg-slate-900 text-white font-extrabold px-8 py-4 rounded-xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 text-lg"
            >
              تسجيل الدخول للمنصة <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-5xl mx-auto w-full text-right">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
              <Building className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-3">إدارة العقود والأملاك</h3>
            <p className="text-slate-600 font-semibold leading-relaxed text-sm">
              متابعة دقيقة لكل عقار، متى يبدأ وينتهي العقد، ومن هو المستأجر، مع أرشفة الوثائق تلقائياً.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-indigo-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100">
              <Clock className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-3">تحصيل تلقائي للإيجار</h3>
            <p className="text-slate-600 font-semibold leading-relaxed text-sm">
              إشعارات فورية عن مواعيد الإيجار وتأخر الدفعات لتسهيل اتخاذ الإجراءات القانونية سريعاً.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-emerald-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
              <ShieldCheck className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-3">تقارير مالية وشفافية</h3>
            <p className="text-slate-600 font-semibold leading-relaxed text-sm">
              كشوفات حساب ومصاريف وتوريدات لكل مالك تصدر بضغطة زر لضمان الشفافية المطلقة.
            </p>
          </div>
        </div>
      </main>
      
      <footer className="py-10 text-center text-slate-500 text-sm font-bold mt-20">
        &copy; {new Date().getFullYear()} نظام إدارة الأملاك والمحاماة. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
}
