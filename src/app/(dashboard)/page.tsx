import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, DollarSign, TrendingUp, TrendingDown, Users } from "lucide-react";

export default async function DashboardPage() {
  // Mock data for initial UI rendering since Supabase might not be connected
  let expectedRevenue = 15000;
  let collectedRevenue = 12500;
  let totalExpenses = 4200;
  let netCashFlow = collectedRevenue - totalExpenses;
  let alerts = [
    { id: 1, type: "delayed", message: "Contract for Property A is delayed." },
    { id: 2, type: "litigation", message: "Contract for Property B escalated to litigation." }
  ];

  try {
    // Attempt to fetch from Supabase if connected
    // This is placeholder logic to demonstrate Supabase integration
    const { data: contracts } = await supabase.from('contracts').select('*');
    if (contracts && contracts.length > 0) {
      // Calculate real values here if DB has data
    }
  } catch (error) {
    console.error("Supabase connection error:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Property Management Dashboard</h1>
        <Link
          href="/clients"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Users className="w-4 h-4" />
          <span>Manage Clients</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3 text-gray-500 mb-2">
            <DollarSign className="w-5 h-5" />
            <h3 className="font-medium">Expected Monthly</h3>
          </div>
          <p className="text-2xl font-bold">${expectedRevenue.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3 text-gray-500 mb-2">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-medium">Collected</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">${collectedRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3 text-gray-500 mb-2">
            <TrendingDown className="w-5 h-5" />
            <h3 className="font-medium">Total Expenses</h3>
          </div>
          <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3 text-gray-500 mb-2">
            <DollarSign className="w-5 h-5" />
            <h3 className="font-medium">Net Cash Flow</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">${netCashFlow.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Alerts & Status Tracking</h2>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border flex items-start space-x-3 ${
                alert.type === "litigation" ? "bg-red-50 border-red-200 text-red-800" : "bg-yellow-50 border-yellow-200 text-yellow-800"
              }`}
            >
              <AlertTriangle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium capitalize">{alert.type} Status</p>
                <p className="text-sm mt-1">{alert.message}</p>
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <p className="text-gray-500">No alerts at this time.</p>
          )}
        </div>
      </div>
    </div>
  );
}
