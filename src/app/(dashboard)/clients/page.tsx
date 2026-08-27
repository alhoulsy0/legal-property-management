"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Plus, Building, ChevronRight, Search, Phone } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState([
    { id: 1, name: "Acme Corp", phone: "+962 7 9123 4567", properties: 3, status: "Active" },
    { id: 2, name: "Global Real Estate", phone: "+962 7 8123 4567", properties: 5, status: "Active" },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClientName) {
      const newClient = {
        id: clients.length + 1,
        name: newClientName,
        phone: newClientPhone,
        properties: 0,
        status: "Active"
      };
      setClients([...clients, newClient]);
      setIsAdding(false);
      setNewClientName("");
      setNewClientPhone("");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Client Directory</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Manage your client relationships and portfolios</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-sm hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 relative overflow-hidden">
          <h2 className="text-xl font-bold mb-5 text-slate-900">Onboard New Client</h2>
          <form onSubmit={handleAddClient} className="space-y-5 max-w-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client Name</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-sm"
                  required
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-sm"
                    placeholder="+962 7 9000 0000"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                className="bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 font-semibold text-sm transition-colors shadow-sm"
              >
                Save Client
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-white text-slate-700 border border-slate-200 px-5 py-2 rounded-lg hover:bg-slate-50 font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search clients..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Client Details</th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Portfolio</th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shadow-sm">
                      {client.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-bold text-slate-900">{client.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600 font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {client.phone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md w-max">
                    <Building className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                    {client.properties} Units
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 inline-flex text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {client.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link 
                    href={`/clients/${client.id}`} 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    View <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
