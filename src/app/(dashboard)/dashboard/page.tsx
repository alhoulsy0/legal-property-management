"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, DollarSign, TrendingUp, TrendingDown, Users, ChevronRight, Activity, Calendar, CheckSquare, Clock, Plus } from "lucide-react";
import { useGlobal } from "../GlobalProvider";

export default function DashboardPage() {
  const { properties } = useGlobal();

  let expectedRevenue = properties.reduce((acc, curr) => acc + curr.revenue, 0);
  let totalExpenses = properties.reduce((acc, curr) => {
    return acc + (curr.expenses?.reduce((eAcc, eCurr) => eAcc + eCurr.amount, 0) || 0);
  }, 0);
  let netCashFlow = expectedRevenue - totalExpenses;
  
  let alerts = [
    { id: 1, type: "delayed", message: "Rent for Sunset Apts is 5 days late.", priority: "medium" },
    { id: 2, type: "litigation", message: "Eviction notice filed for Property B.", priority: "high" }
  ];

  let upcomingActivities = [
    { id: 1, date: "Oct 1", title: "Lease Renewal - John Doe", time: "10:00 AM" },
    { id: 2, date: "Oct 3", title: "Property Inspection - Unit 4B", time: "2:00 PM" },
    { id: 3, date: "Oct 5", title: "Court Hearing - Case #842", time: "9:00 AM" },
  ];

  const [tasks, setTasks] = useState([
    { id: 1, text: "Review new tenant background checks", done: false },
    { id: 2, text: "Send late payment notices for Sept", done: true },
    { id: 3, text: "Draft commercial lease for Acme Corp", done: false },
  ]);
  const [newTaskText, setNewTaskText] = useState("");

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1 text-sm font-semibold">Real-time metrics and operational status</p>
        </div>
        <Link
          href="/clients"
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors font-bold flex items-center space-x-2 text-sm shadow-md"
        >
          <Users className="w-5 h-5" />
          <span>Manage Clients</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 text-slate-500 mb-3">
            <div className="p-2 bg-slate-100 rounded-xl">
              <DollarSign className="w-5 h-5 text-slate-700" />
            </div>
            <h3 className="text-sm font-bold text-slate-600">Expected Total</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">${expectedRevenue.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 text-emerald-600 mb-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold">Collected (Mock)</h3>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">${(expectedRevenue * 0.8).toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 text-rose-600 mb-3">
            <div className="p-2 bg-rose-50 rounded-xl text-rose-700">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold">Total Expenses</h3>
          </div>
          <p className="text-3xl font-extrabold text-rose-600">${totalExpenses.toLocaleString()}</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl shadow-md border border-slate-800">
          <div className="flex items-center space-x-3 text-slate-300 mb-3">
            <div className="p-2 bg-slate-800 rounded-xl text-white">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Net Cash Flow</h3>
          </div>
          <p className="text-3xl font-extrabold text-white">${netCashFlow.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                Active Alerts
              </h2>
              <span className="bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1 rounded-full">{alerts.length} Issues</span>
            </div>
            <div className="grid gap-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${alert.priority === "high" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-extrabold capitalize ${alert.priority === "high" ? "text-rose-800" : "text-amber-800"}`}>
                      {alert.type} Status
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
                To-Do List
              </h2>
            </div>
            
            <form onSubmit={addTask} className="mb-5 flex gap-3">
              <input
                type="text"
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder-slate-500"
              />
              <button type="submit" className="px-5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-sm">
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 cursor-pointer" onClick={() => toggleTask(task.id)}>
                  <input type="checkbox" checked={task.done} readOnly className="w-5 h-5 rounded border-slate-300 text-blue-600 pointer-events-none" />
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
              Upcoming Activities
            </h2>
          </div>
          <div className="flex-1 space-y-6">
            {upcomingActivities.map((activity, i) => (
              <div key={activity.id} className="relative pl-8 pb-6 last:pb-0">
                {i !== upcomingActivities.length - 1 && (
                  <div className="absolute left-[9px] top-6 bottom-0 w-[2px] bg-slate-200"></div>
                )}
                <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-indigo-600 bg-white"></div>
                <div>
                  <span className="text-xs font-black text-indigo-700 uppercase tracking-wider">{activity.date}</span>
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
    </div>
  );
}
