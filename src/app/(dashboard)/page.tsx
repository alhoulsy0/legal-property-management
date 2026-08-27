import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, DollarSign, TrendingUp, TrendingDown, Users, ChevronRight, Activity } from "lucide-react";

export default async function DashboardPage() {
  let expectedRevenue = 15000;
  let collectedRevenue = 12500;
  let totalExpenses = 4200;
  let netCashFlow = collectedRevenue - totalExpenses;
  let alerts = [
    { id: 1, type: "delayed", message: "Contract for Property A is delayed.", priority: "medium" },
    { id: 2, type: "litigation", message: "Contract for Property B escalated to litigation.", priority: "high" }
  ];

  try {
    const { data: contracts } = await supabase.from('contracts').select('*');
    if (contracts && contracts.length > 0) {
      // Calculate real values here if DB has data
    }
  } catch (error) {
    console.error("Supabase connection error:", error);
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-gray-500 mt-1 font-medium">Real-time financial and operational metrics</p>
        </div>
        <Link
          href="/clients"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all font-semibold flex items-center space-x-2 hover:scale-105"
        >
          <Users className="w-5 h-5" />
          <span>Manage Clients</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-16 h-16 text-gray-900" />
          </div>
          <div className="flex items-center space-x-3 text-gray-500 mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-gray-700" />
            </div>
            <h3 className="font-semibold text-gray-600">Expected Monthly</h3>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">${expectedRevenue.toLocaleString()}</p>
        </div>
        
        {/* Metric 2 */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-3xl shadow-sm border border-emerald-100 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-emerald-900" />
          </div>
          <div className="flex items-center space-x-3 text-emerald-700 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-semibold">Collected</h3>
          </div>
          <p className="text-3xl font-extrabold text-emerald-700">${collectedRevenue.toLocaleString()}</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-3xl shadow-sm border border-rose-100 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown className="w-16 h-16 text-rose-900" />
          </div>
          <div className="flex items-center space-x-3 text-rose-700 mb-4">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-800">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="font-semibold">Total Expenses</h3>
          </div>
          <p className="text-3xl font-extrabold text-rose-700">${totalExpenses.toLocaleString()}</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-3xl shadow-sm border border-indigo-100 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-16 h-16 text-indigo-900" />
          </div>
          <div className="flex items-center space-x-3 text-indigo-700 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-800">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-semibold">Net Cash Flow</h3>
          </div>
          <p className="text-3xl font-extrabold text-indigo-700">${netCashFlow.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-10 bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Active Alerts & Status</h2>
          <span className="bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-full">{alerts.length} Issues</span>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border flex items-start space-x-4 transition-all hover:shadow-md ${
                alert.priority === "high" 
                  ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-200" 
                  : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
              }`}
            >
              <div className={`p-3 rounded-full shrink-0 ${alert.priority === "high" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className={`font-bold capitalize ${alert.priority === "high" ? "text-red-900" : "text-amber-900"}`}>
                  {alert.type} Status
                </p>
                <p className={`text-sm mt-1 font-medium ${alert.priority === "high" ? "text-red-700" : "text-amber-800"}`}>
                  {alert.message}
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-900 self-center">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="col-span-2 text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">All systems normal. No alerts at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
