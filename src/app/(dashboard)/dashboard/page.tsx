"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, DollarSign, TrendingUp, TrendingDown, Users, Activity, Calendar, CheckSquare, Clock, Plus } from "lucide-react";
import { useGlobal } from "../GlobalProvider";

export default function DashboardPage() {
  const { properties, tasks, setTasks, clients, setProperties } = useGlobal();

  const updatePropertyStatus = (id: number, field: string, value: string) => {
    setProperties(properties.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  let expectedRevenue = properties.reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);
  let totalExpenses = properties.reduce((acc, curr) => {
    return acc + (curr.expenses?.reduce((eAcc, eCurr) => eAcc + (Number(eCurr.amount) || 0), 0) || 0);
  }, 0);
  let netCashFlow = expectedRevenue - totalExpenses;
  
  // Dynamic Alerts
  let alerts: any[] = [];
  properties.forEach(p => {
    if (p.status === "Delayed") {
      alerts.push({ id: `d-${p.id}`, type: "متأخر", message: `الإيجار متأخر لعقار ${p.name}.`, priority: "medium" });
    } else if (p.status === "Litigation") {
      alerts.push({ id: `l-${p.id}`, type: "قضية منظورة", message: `نزاع قانوني جاري على ${p.name}.`, priority: "high" });
    }
  });

  // Dynamic Upcoming Activities based on properties data
  let upcomingActivities: any[] = [];
  const today = new Date();
  
  properties.forEach(p => {
    if (p.nextRentDate) {
      const rentDate = new Date(p.nextRentDate);
      const diffDays = Math.ceil((rentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 14) { 
        upcomingActivities.push({
          id: `rent-${p.id}`,
          date: p.nextRentDate,
          rawDate: rentDate,
          title: `تحصيل إيجار: ${p.name}`,
          time: "09:00 صباحاً"
        });
      }
    }
    
    if (p.endDate) {
      const contractDate = new Date(p.endDate);
      const diffDays = Math.ceil((contractDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 30) { 
        upcomingActivities.push({
          id: `contract-${p.id}`,
          date: p.endDate,
          rawDate: contractDate,
          title: `انتهاء عقد: ${p.name}`,
          time: "10:00 صباحاً"
        });
      }
    }
  });

  upcomingActivities.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
  
  if (upcomingActivities.length === 0) {
    upcomingActivities.push({ id: "none", date: "-", rawDate: new Date(), title: "لا توجد نشاطات مجدولة", time: "-" });
  } else {
    upcomingActivities = upcomingActivities.slice(0, 5);
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">اللوحة الرئيسية</h1>
          <p className="text-slate-500 mt-1 text-sm font-semibold">متابعة فورية للمؤشرات المالية والقانونية</p>
        </div>
        <Link
          href="/clients"
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors font-bold flex items-center gap-2 text-sm shadow-md"
        >
          <Users className="w-5 h-5" />
          <span>إدارة الموكلين</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 text-slate-500 mb-3">
            <div className="p-2 bg-slate-100 rounded-xl">
              <DollarSign className="w-5 h-5 text-slate-700" />
            </div>
            <h3 className="text-sm font-bold text-slate-600">إجمالي الإيجارات (المتوقعة)</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">د.أ {expectedRevenue.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 text-emerald-600 mb-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold">المحصل فعلياً (تجريبي)</h3>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">د.أ {(expectedRevenue * 0.8).toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 text-rose-600 mb-3">
            <div className="p-2 bg-rose-50 rounded-xl text-rose-700">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold">إجمالي المصروفات</h3>
          </div>
          <p className="text-3xl font-extrabold text-rose-600">د.أ {totalExpenses.toLocaleString()}</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl shadow-md border border-slate-800">
          <div className="flex items-center gap-3 text-slate-300 mb-3">
            <div className="p-2 bg-slate-800 rounded-xl text-white">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">صافي التدفقات للملاك</h3>
          </div>
          <p className="text-3xl font-extrabold text-white">د.أ {netCashFlow.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
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
                  <div>
                    <p className={`text-sm font-extrabold ${alert.priority === "high" ? "text-rose-800" : "text-amber-800"}`}>
                      حالة: {alert.type}
                    </p>
                    <p className="text-sm mt-1 text-slate-600 font-semibold">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder-slate-500"
              />
              <button type="submit" className="px-5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-sm">
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <div className="space-y-2 overflow-y-auto pl-2 custom-scrollbar">
              {tasks.length === 0 && <p className="text-sm font-bold text-slate-500 italic p-2 text-center">لا توجد مهام معلقة!</p>}
              {tasks.map(task => (
                <div key={task.id} className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-slate-200 cursor-pointer ${task.done ? 'bg-slate-100 opacity-50 scale-95' : 'bg-slate-50 hover:bg-slate-100'}`} onClick={() => toggleTask(task.id)}>
                  <input type="checkbox" checked={task.done} readOnly className="w-5 h-5 rounded border-slate-300 text-blue-600 pointer-events-none placeholder-slate-500" />
                  <span className={`text-sm font-bold ${task.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

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
                <div className="absolute right-0 top-1.5 w-5 h-5 rounded-full border-4 border-indigo-600 bg-white"></div>
                <div>
                  <span className="text-xs font-black text-indigo-700 tracking-wider">{activity.date}</span>
                  <p className="text-sm font-bold text-slate-900 mt-1">{activity.title}</p>
                  <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5 font-bold">
                    <Clock className="w-4 h-4" /> {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">إدارة سريعة للعقارات</h2>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="py-4 px-4 text-xs font-black text-slate-500 border-b border-slate-200 rounded-tr-xl">الموكل (المالك)</th>
                <th className="py-4 px-4 text-xs font-black text-slate-500 border-b border-slate-200">العقار</th>
                <th className="py-4 px-4 text-xs font-black text-slate-500 border-b border-slate-200">تاريخ الإيجار</th>
                <th className="py-4 px-4 text-xs font-black text-slate-500 border-b border-slate-200">الحالة القانونية</th>
                <th className="py-4 px-4 text-xs font-black text-slate-500 border-b border-slate-200 rounded-tl-xl">حالة التوريد للمالك</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {properties.map(prop => {
                const client = clients.find(c => c.id === prop.clientId);
                return (
                  <tr key={prop.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 text-sm font-bold text-slate-800">{client?.name || 'غير معروف'}</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-800">{prop.name}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-slate-600">{prop.nextRentDate || '-'}</td>
                    <td className="py-4 px-4">
                      <select 
                        value={prop.status} 
                        onChange={(e) => updatePropertyStatus(prop.id, 'status', e.target.value)}
                        className={`text-xs font-black px-3 py-1.5 rounded-lg border outline-none cursor-pointer ${
                          prop.status === 'نشط' || prop.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          prop.status === 'متأخر' || prop.status === 'Delayed' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <option value="نشط">نشط</option>
                        <option value="متأخر">متأخر</option>
                        <option value="قضية منظورة">قضية منظورة</option>
                        <option value="محجوز">محجوز (موقوف)</option>
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <select 
                        value={prop.payoutStatus === 'Paid to Landlord' ? 'تم التحويل' : 'قيد التحصيل'} 
                        onChange={(e) => updatePropertyStatus(prop.id, 'payoutStatus', e.target.value === 'تم التحويل' ? 'Paid to Landlord' : 'قيد التحصيل')}
                        className={`text-xs font-black px-3 py-1.5 rounded-lg border outline-none cursor-pointer ${
                          prop.payoutStatus === 'Paid to Landlord' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="قيد التحصيل">قيد التحصيل</option>
                        <option value="تم التحويل">تم التحويل (Paid)</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              {properties.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm font-bold text-slate-400">لا توجد عقارات مسجلة.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
