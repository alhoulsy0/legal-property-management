import Link from "next/link";
import { Scale, Building, ShieldCheck, Clock, ArrowLeft, Files, Check, UserCheck, Calendar, Briefcase, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white rtl">
      
      {/* Background Glows (SAS/Legal Tech Aesthetic) */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full -z-10"></div>
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-indigo-900/10 blur-[150px] rounded-full -z-10"></div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center z-10 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            ميزان لخدمات الإدارة القانونية للأملاك
          </span>
        </div>
        <Link 
          href="/login" 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm flex items-center gap-2 shadow-md shadow-blue-950/40"
        >
          <span>تسجيل دخول المحامين</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-7xl mx-auto w-full relative">
        <div className="max-w-4xl space-y-8 mt-20 text-center">
          
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-950/40 border border-blue-800/40 text-blue-400 font-extrabold text-xs tracking-wide uppercase">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            منصة SaaS لـ مكاتب المحاماة والشركات العقارية بالأردن
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-[1.15] text-white">
            النظام القضائي الموحد <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
              لإدارة العقارات والنزاعات القانونية
            </span>
          </h1>
          
          <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            أول نظام متكامل لإدارة الأملاك العقارية والمحاكمة القضائية الأردنية. وثّق الوكالات العدلية، تابع أجندة الجلسات، أرشف لوائح الدعوى والمحاضر سحابياً، وحصّل الإيجارات بكل شفافية.
          </p>
          
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/login" 
              className="w-full sm:w-auto bg-white text-slate-950 font-black px-8 py-4 rounded-xl shadow-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3 text-lg"
            >
              <span>ابدأ التجربة المجانية</span>
              <ArrowLeft className="w-5 h-5 text-slate-950" />
            </Link>
          </div>
        </div>

        {/* Dynamic SaaS Feature Matrix */}
        <div className="mt-32 w-full space-y-6">
          <h2 className="text-2xl md:text-4xl font-extrabold text-center text-white">مميزات متكاملة لإدارة أعمالك القانونية والعقارية</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto text-center font-bold">بنيّة برمجية مخصصة للأحكام والمحاكم الأردنية تدعم أتمتة مكاتب التمثيل القانوني بالكامل</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 w-full text-right">
            
            {/* Feature 1 */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="bg-blue-950/60 w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-blue-900/50">
                  <Scale className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">إدارة القضايا والوكالات</h3>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                  سجل قضايا تفصيلي حسب نظام المحاكم الأردنية (صلح، بداية، استئناف) يوثق الوكالات العدلية وتواريخ صدورها وحالتها (فعالة أو معزولة).
                </p>
              </div>
              <span className="text-[10px] text-blue-400 font-black tracking-wider uppercase mt-4 block">مساعد الخطوات للخصوم &larr;</span>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="bg-indigo-950/60 w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-indigo-900/50">
                  <Calendar className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">أجندة الجلسات الذكية</h3>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                  تنبيهات وجدولة آلية لـ محاضر وضبط الجلسات القضائية مع نظام إشعارات ذكي يُذكّرك بالطلبات والقرارات قبل موعد الجلسة بـ 48 ساعة.
                </p>
              </div>
              <span className="text-[10px] text-indigo-400 font-black tracking-wider uppercase mt-4 block">ترتيب ذكي حسب الأولوية &larr;</span>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="bg-emerald-950/60 w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-emerald-900/50">
                  <Files className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">مستودع المستندات (Vault)</h3>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                  أرشفة سحابية منظمة للمستندات واللوائح والقرارات القضائية والبينات تحت فروع مصنفة بدقة ومدعومة بحماية RLS مشددة.
                </p>
              </div>
              <span className="text-[10px] text-emerald-400 font-black tracking-wider uppercase mt-4 block">تخزين سحابي محمي &larr;</span>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="bg-amber-950/60 w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-amber-900/50">
                  <Building className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">إدارة الأملاك العقارية</h3>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                  عقود الإيجار، وتعديل وتمديد الفترات، ومقدار الزيادة السنوية للمستأجرين، وكشوف حساب التوريدات والمصاريف بكل عقار.
                </p>
              </div>
              <span className="text-[10px] text-amber-400 font-black tracking-wider uppercase mt-4 block">تقارير مالية وتوريد &larr;</span>
            </div>

          </div>
        </div>

        {/* Pricing SaaS Tiers Mockup */}
        <div className="mt-32 w-full space-y-6 pb-20">
          <h2 className="text-2xl md:text-4xl font-extrabold text-center text-white">باقات اشتراك SaaS مرنة تناسب طموح مكتبك</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto text-center font-bold">ابدأ مجاناً وقم بالترقية مع توسع أعمالك القضائية والعقارية</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full text-right">
            
            {/* Tier 1 */}
            <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-850 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <span className="text-slate-400 text-xs font-black block">محامي مستقل</span>
                <p className="text-3xl font-black text-white">0 د.أ <span className="text-slate-500 text-xs font-bold">/ شهريا</span></p>
                <p className="text-xs text-slate-400 font-medium">مثالي للمحامين المستقلين لإدارة عدد محدود من الأملاك والنزاعات.</p>
                <hr className="border-slate-850" />
                <ul className="space-y-2 text-xs font-bold text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> لغاية 5 قضايا نشطة</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> إدارة 3 ملاك وعقاراتهم</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> مستودع ملفات لغاية 1 جيجابايت</li>
                </ul>
              </div>
              <Link href="/login" className="mt-8 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-center text-xs transition-colors">تسجيل مجاني</Link>
            </div>

            {/* Tier 2 (Popular) */}
            <div className="bg-slate-900/60 p-8 rounded-3xl border-2 border-blue-600 flex flex-col justify-between relative overflow-hidden shadow-xl shadow-blue-950/20">
              <div className="absolute top-3 left-3 bg-blue-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">الأكثر طلباً</div>
              <div className="space-y-4">
                <span className="text-blue-400 text-xs font-black block">مكتب محاماة نمو</span>
                <p className="text-3xl font-black text-white">49 د.أ <span className="text-slate-500 text-xs font-bold">/ شهريا</span></p>
                <p className="text-xs text-slate-350 font-medium">الباقة المتكاملة لمكاتب المحاماة المتوسطة لمتابعة الجلسات وتحصيل الإيجار.</p>
                <hr className="border-slate-800" />
                <ul className="space-y-2 text-xs font-bold text-slate-200">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500 shrink-0" /> قضايا ووكالات غير محدودة</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500 shrink-0" /> إدارة عقارات وملاك لغاية 50 مالك</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500 shrink-0" /> أرشفة وضبط الجلسات مع إشعارات 48 ساعة</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500 shrink-0" /> مساحة سحابية 20 جيجابايت (RLS Vault)</li>
                </ul>
              </div>
              <Link href="/login" className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl text-center text-xs transition-colors shadow-md">ابدأ فترة تجريبية 14 يوم</Link>
            </div>

            {/* Tier 3 */}
            <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-850 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <span className="text-slate-400 text-xs font-black block">شركات الاستثمار العقاري</span>
                <p className="text-3xl font-black text-white">120 د.أ <span className="text-slate-500 text-xs font-bold">/ شهريا</span></p>
                <p className="text-xs text-slate-400 font-medium">للشركات والمحافظ الاستثمارية الكبيرة التي تدير مئات العقارات وعشرات المحامين.</p>
                <hr className="border-slate-850" />
                <ul className="space-y-2 text-xs font-bold text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> كل ميزات باقة نمو بالكامل</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> عقارات وملاك ومستأجرين غير محدودين</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> لوحات تحكم مالية وتوريد بنكي مخصص</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> دعم فني مباشر 24/7</li>
                </ul>
              </div>
              <Link href="/login" className="mt-8 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-center text-xs transition-colors">اتصل بالمبيعات</Link>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-10 text-center text-slate-500 text-xs font-bold">
        &copy; {new Date().getFullYear()} ميزان - نظام إدارة الأملاك والنزاعات القانونية SaaS. جميع الحقوق محفوظة للأردن.
      </footer>
    </div>
  );
}
