"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Plus, Building, ChevronRight, Search } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState([
    { id: 1, name: "Acme Corp", contact_info: "contact@acme.com", properties: 3, status: "Active" },
    { id: 2, name: "Global Real Estate", contact_info: "info@globalre.com", properties: 5, status: "Active" },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientContact, setNewClientContact] = useState("");

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClientName) {
      const newClient = {
        id: clients.length + 1,
        name: newClientName,
        contact_info: newClientContact,
        properties: 0,
        status: "Active"
      };
      setClients([...clients, newClient]);
      setIsAdding(false);
      setNewClientName("");
      setNewClientContact("");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Client Directory</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage your client relationships and portfolios</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all font-semibold flex items-center space-x-2 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Client</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl -z-10 opacity-60"></div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Onboard New Client</h2>
          <form onSubmit={handleAddClient} className="space-y-5 max-w-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Client Name</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                  required
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Email</label>
                <input
                  type="email"
                  value={newClientContact}
                  onChange={(e) => setNewClientContact(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                  placeholder="e.g. contact@acme.com"
                />
              </div>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 font-semibold transition-colors shadow-md"
              >
                Save Client
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-white text-gray-700 border border-gray-200 px-6 py-2.5 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/50">
          <div className="relative w-72">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search clients..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client Details</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Portfolio Size</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-transparent">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-indigo-50/30 transition-colors group">
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                      {client.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900">{client.name}</div>
                      <div className="text-sm text-gray-500 font-medium">{client.contact_info}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center text-sm font-medium text-gray-700 bg-gray-100/80 px-3 py-1.5 rounded-lg w-max">
                    <Building className="h-4 w-4 mr-2 text-indigo-500" />
                    {client.properties} Properties
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-emerald-100 text-emerald-800">
                    {client.status}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                  <Link 
                    href={`/clients/${client.id}`} 
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors group-hover:scale-105"
                  >
                    View Profile <ChevronRight className="w-4 h-4 ml-1" />
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
