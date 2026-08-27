import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, DollarSign, TrendingUp, TrendingDown, Users, ChevronRight, Activity, Calendar, CheckSquare, Clock } from "lucide-react";

export default async function DashboardPage() {
  let expectedRevenue = 15000;
  let collectedRevenue = 12500;
  let totalExpenses = 4200;
  let netCashFlow = collectedRevenue - totalExpenses;
  
  let alerts = [
    { id: 1, type: "delayed", message: "Rent for Sunset Apts is 5 days late.", priority: "medium" },
    { id: 2, type: "litigation", message: "Eviction notice filed for Property B.", priority: "high" }
  ];

  let upcomingActivities = [
    { id: 1, date: "Oct 1", title: "Lease Renewal - John Doe", time: "10:00 AM" },
    { id: 2, date: "Oct 3", title: "Property Inspection - Unit 4B", time: "2:00 PM" },
    { id: 3, date: "Oct 5", title: "Court Hearing - Case #842", time: "9:00 AM" },
  ];

  let tasks = [
    { id: 1, text: "Review new tenant background checks", done: false },
    { id: 2, text: "Send late payment notices for Sept", done: true },
    { id: 3, text: "Draft commercial lease for Acme Corp", done: false },
  ];

  try {
    const { data: contracts } = await supabase.from('contracts').select('*');
    if (contracts && contracts.length > 0) {}
  } catch (error) {
    console.error("Supabase connection error:", error);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Real-time metrics and operational status</p>
        </div>
        <Link
          href="/clients"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-2 text-sm shadow-sm"
        >
          <Users className="w-4 h-4" />
          <span>Manage Clients</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 text-slate-500 mb-3">
            <div className="p-1.5 bg-slate-100 rounded-lg">
              <DollarSign className="w-4 h-4 text-slate-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-600">Expected Monthly</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900">${expectedRevenue.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 text-emerald-600 mb-3">
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold">Collected</h3>
          </div>
          <p className="text-2xl font-bold text-emerald-600">${collectedRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 text-rose-600 mb-3">
            <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold">Total Expenses</h3>
          </div>
          <p className="text-2xl font-bold text-rose-600">${totalExpenses.toLocaleString()}</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-800">
          <div className="flex items-center space-x-3 text-slate-300 mb-3">
            <div className="p-1.5 bg-slate-800 rounded-lg text-white">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Net Cash Flow</h3>
          </div>
          <p className="text-2xl font-bold text-white">${netCashFlow.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Alerts and Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Active Alerts
              </h2>
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{alerts.length} Issues</span>
            </div>
            
            <div className="grid gap-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${alert.priority === "high" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"}`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold capitalize ${alert.priority === "high" ? "text-rose-700" : "text-amber-700"}`}>
                      {alert.type} Status
                    </p>
                    <p className="text-sm mt-0.5 text-slate-600 font-medium">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-500" />
                To-Do List
              </h2>
            </div>
            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <input type="checkbox" checked={task.done} readOnly className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className={`text-sm font-medium ${task.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Calendar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Upcoming Activities
            </h2>
          </div>
          
          <div className="flex-1 space-y-6">
            {upcomingActivities.map((activity, i) => (
              <div key={activity.id} className="relative pl-6 pb-6 last:pb-0">
                {/* Timeline line */}
                {i !== upcomingActivities.length - 1 && (
                  <div className="absolute left-[7px] top-5 bottom-0 w-px bg-slate-200"></div>
                )}
                {/* Timeline dot */}
                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-indigo-500 bg-white"></div>
                
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{activity.date}</span>
                  <p className="text-sm font-bold text-slate-900 mt-1">{activity.title}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" /> {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="mt-6 w-full py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            View Full Calendar
          </button>
        </div>
      </div>
    </div>
  );
}
