"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, DollarSign, TrendingUp, TrendingDown, Users, Activity, Calendar, CheckSquare, Clock, Plus, Scale, Building } from "lucide-react";
import { useGlobal } from "../GlobalProvider";

export default function DashboardPage() {
  const { 
    properties, 
    tasks, setTasks, 
    clients, 
    cases, 
    hearings, 
    legalFinancials 
  } = useGlobal();

  // 1. PROPERTY MANAGEMENT METRICS
  let expectedRevenue = properties.reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);
  let totalExpenses = properties.reduce((acc, curr) => {
    return acc + (curr.expenses?.reduce((eAcc, eCurr) => eAcc + (Number(eCurr.amount) || 0), 0) || 0);
  }, 0);
  let netCashFlow = expectedRevenue - totalExpenses;

  // 2. LEGAL SYSTEM METRICS
  const activeCasesCount = cases.filter(c => c.status === "مفتوحة" || c.status === "نشطة").length;
  const totalClaimsSum = cases.reduce((sum, c) => sum + (c.claimAmount || 0), 0);
  
  // 3. DUAL ALERTS & NOTIFICATIONS (Delayed rents + Legal deadlines)
  let alerts: any[] = [];
  const today = new Date();

  // Property alerts
  properties.forEach(p => {
    if (p.status === "Delayed") {
      alerts.push({ id: `d-${p.id}`, type: "إيجار متأخر", message: `الإيجار متأخر لعقار: ${p.name}.`, priority: "medium" });
    } else if (p.status === "Litigation") {
      alerts.push({ id: `l-${p.id}`, type: "نزاع قضائي جاري", message: `نزاع قانوني معلق لعقار: ${p.name}.`, priority: "high" });
    }
  });

  // Case Appeal alerts
  cases.forEach(c => {
    if (c.appeal_deadline) {
      const deadline = new Date(c.appeal_deadline);
      const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 15) {
        alerts.push({
          id: `case-appeal-${c.id}`,
          type: "اقتراب انتهاء مهلة الاستئناف",
          message: `تنبيه: اقتراب انتهاء مهلة الاستئناف للدعوى رقم (${c.caseNumber}) المتبقي ${diffDays} أيام.`,
          priority: "high"
        });
      }
    }
  });

  // 4. COMBINED SYSTEM ACTIVITIES (Rents, Expiries, Court Hearings)
  let upcomingActivities: any[] = [];
  
  // Property Rent Activities
  properties.forEach(p => {
    if (p.nextRentDate) {
      const rentDate = new Date(p.nextRentDate);
      const diffDays = Math.ceil((rentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 30) { 
        upcomingActivities.push({
          id: `rent-${p.id}`,
          date: p.nextRentDate,
          rawDate: rentDate,
          title: `تحصيل إيجار: ${p.name}`,
          time: "09:00 صباحاً",
          type: "property"
        });
      }
    }
    
    // Property Contract Expiries
    if (p.endDate) {
      const contractDate = new Date(p.endDate);
      const diffDays = Math.ceil((contractDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 30) { 
        upcomingActivities.push({
          id: `contract-${p.id}`,
          date: p.endDate,
          rawDate: contractDate,
          title: `انتهاء عقد: ${p.name}`,
          time: "10:00 صباحاً",
          type: "property"
        });
      }
    }
  });

  // Legal Court Hearings Activities
  hearings.forEach(h => {
    if (h.nextSessionDate) {
      const sessionDate = new Date(h.nextSessionDate);
      const diffDays = Math.ceil((sessionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 30) {
        const c = cases.find(cs => cs.id === h.caseId);
        const caseLabel = c ? ` رقم ${c.caseNumber}` : "";
        upcomingActivities.push({
          id: `hearing-${h.id}`,
          date: h.nextSessionDate.split("T")[0],
          rawDate: sessionDate,
          title: `جلسة محكمة: دعوى${caseLabel}`,
          time: "10:30 صباحاً",
          type: "legal"
        });
      }
    }
  });

  upcomingActivities.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
  
  if (upcomingActivities.length === 0) {
    upcomingActivities.push({ id: "none", date: "-", rawDate: new Date(), title: "لا توجد نشاطات مجدولة", time: "-" });
  } else {
    upcomingActivities = upcomingActivities.slice(0, 7);
  }

  const [newTaskText, setNewTaskText] = useState("");

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: true } : t));
    
    setTimeout(() => {
      setTasks(current => current.filter(t => t.id !== id));
    }, 400);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      setTasks([{ id: Date.now(), text: newTaskText, done: false }, ...tasks]);
      setNewTaskText("");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-right">
      
      {/* Title & Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">لوحة القيادة الموحدة</h1>
          <p className="text-slate-500 mt-1 text-sm font-semibold">متابعة فورية للمؤشرات المالية للأملاك والعقارات بالإضافة للملفات القانونية</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/clients"
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl transition-colors font-bold flex items-center gap-2 text-sm shadow-sm"
          >
            <Building className="w-4 h-4 text-slate-600" />
            <span>إدارة العقارات</span>
          </Link>
          <Link
            href="/cases"
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors font-bold flex items-center gap-2 text-sm shadow-md"
          >
            <Scale className="w-5 h-5 text-blue-400" />
            <span>سجل القضايا</span>
          </Link>
        </div>
      </div>

      {/* Grid Metrics - Reflects both Properties & Legal Cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Expected Rent (Property) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 text-slate-500 mb-3">
            <div className="p-2 bg-slate-100 rounded-xl">
              <DollarSign className="w-5 h-5 text-slate-700" />
            </div>
            <h3 className="text-sm font-bold text-slate-655">إجمالي الإيجارات (المتوقعة)</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">د.أ {expectedRevenue.toLocaleString()}</p>
        </div>
        
        {/* Metric 2: Active Cases (Legal) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 text-emerald-600 mb-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold">ملفات القضايا النشطة</h3>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{activeCasesCount} قضايا</p>
        </div>

        {/* Metric 3: Total Claims (Legal) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 text-indigo-600 mb-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold">إجمالي المطالبات القضائية</h3>
          </div>
          <p className="text-3xl font-extrabold text-indigo-600">د.أ {totalClaimsSum.toLocaleString()}</p>
        </div>

        {/* Metric 4: Net Property Cash Flow (Property) */}
        <div className="bg-slate-900 p-6 rounded-3xl shadow-md border border-slate-800">
          <div className="flex items-center gap-3 text-slate-350 mb-3">
            <div className="p-2 bg-slate-800 rounded-xl text-white">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">صافي التدفقات للملاك</h3>
          </div>
          <p className="text-3xl font-extrabold text-white">د.أ {netCashFlow.toLocaleString()}</p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Left / Middle components (Alerts + Tasks) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Unified Alerts (Property Delayed Rents + Legal Deadlines) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                الإنذارات والمخالفات النشطة
              </h2>
              <span className="bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1 rounded-full">{alerts.length} حالة</span>
            </div>
            <div className="grid gap-3">
              {alerts.length === 0 && <p className="text-sm font-bold text-slate-500 italic p-2">لا يوجد أي مخالفات حالياً.</p>}
              {alerts.map((alert: any) => (
                <div key={alert.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${alert.priority === "high" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-extrabold ${alert.priority === "high" ? "text-rose-800" : "text-amber-800"}`}>
                      حالة: {alert.type}
                    </p>
                    <p className="text-sm mt-1 text-slate-655 font-semibold leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legal / Admin Tasks */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col max-h-[450px]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-blue-600" />
                المهام القانونية والإدارية
              </h2>
            </div>
            
            <form onSubmit={addTask} className="mb-5 flex gap-3">
              <input
                type="text"
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                placeholder="أضف مهمة جديدة..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder-slate-600 text-slate-900"
              />
              <button type="submit" className="px-5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold shadow-sm">
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <div className="space-y-2 overflow-y-auto pl-2 custom-scrollbar">
              {tasks.length === 0 && <p className="text-sm font-bold text-slate-500 italic p-2 text-center">لا توجد مهام معلقة!</p>}
              {tasks.map(task => (
                <div key={task.id} className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-slate-200 cursor-pointer ${task.done ? 'bg-slate-100 opacity-50 scale-95' : 'bg-slate-50 hover:bg-slate-100'}`} onClick={() => toggleTask(task.id)}>
                  <input type="checkbox" checked={task.done} readOnly className="w-5 h-5 rounded border-slate-300 text-blue-600 pointer-events-none" />
                  <span className={`text-sm font-bold ${task.done ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{task.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Combined system activities timeline (Rents + Court dates) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-600" />
              النشاطات القادمة
            </h2>
          </div>
          <div className="flex-1 space-y-6">
            {upcomingActivities.map((activity, i) => (
              <div key={activity.id} className="relative pr-8 pb-6 last:pb-0">
                {i !== upcomingActivities.length - 1 && (
                  <div className="absolute right-[9px] top-6 bottom-0 w-[2px] bg-slate-200"></div>
                )}
                <div className={`absolute right-0 top-1.5 w-5 h-5 rounded-full border-4 bg-white ${activity.type === 'legal' ? 'border-blue-600' : 'border-indigo-600'}`}></div>
                <div>
                  <span className={`text-xs font-black px-2 py-0.5 rounded ${activity.type === 'legal' ? 'bg-blue-50 text-blue-800' : 'bg-indigo-50 text-indigo-800'}`}>{activity.date}</span>
                  <p className="text-sm font-bold text-slate-900 mt-2">{activity.title}</p>
                  <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5 font-bold">
                    <Clock className="w-4 h-4" /> {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
